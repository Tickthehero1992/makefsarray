window.onload = function(){
    if (window.location.search != '') window.history.pushState(null, '', '/');
    let div = document.getElementById('status_bar');
    let naviButton = document.querySelectorAll('#header > button')[0];
    let naviButton2 = document.querySelectorAll('#header > button')[1];
    let tableStatus = document.getElementById('status_table');
    let tableCharging = document.getElementById('charging_table');
    let tableHolding = document.getElementById('holding_table');
    let softwareVersion = document.querySelector('.soft-child');
    // Making the buttons clickable after loading the Javascript file
    naviButton.disabled = false;
    naviButton2.disabled = false;
    async function getTableData(url){
        const response = await fetch(url, {method: 'POST'});
        if (!response.ok){
            console.log('Server is not responses!');
            return;
        }
        let buffer = await response.arrayBuffer();
        return buffer;
    }
    function inputTable(){
        let asyncResult = getTableData('/input_table.bin');
        asyncResult.then((buffer) => {
            let data = new Int16Array(buffer);
            for (let i = 0; i < 12; i++){
                switch(i){
                    case 0:
                        let statusString = '';
                        switch(data[i]){
                            case 0:
                                statusString = 'Ожидание разрешения на подключение';
                                break;
                            case 1:
                                statusString = 'Подключение коннектора';
                                break;
                            case 2:
                                statusString = 'Инициация рукопожатия';
                                break;
                            case 3:
                                statusString = 'Проверка изоляции';
                                break;
                            case 4:
                                statusString = 'Распознавание зарядного устройства';
                                break;
                            case 5:
                                statusString = 'Обработка параметров зарядки';
                                break;
                            case 6:
                                statusString = 'Зарядка';
                                break;
                            case 7:
                                statusString = 'Приостановка подачи энергии';
                                break;
                            case 8:
                                statusString = 'Окончание зарядной сессии';
                                break;
                            case 9:
                                statusString = 'Окончание зарядки по ошибке станции';
                                break;
                            case 10:
                                statusString = 'Окончание зарядки по ошибке BMS';
                                break;
                            case 11:
                                statusString = 'Разрыв связи по CAN или Modbus';
                                break;
                            case 12:
                                statusString = 'Ошибка физического соединения';
                                break;
                            case 13:
                                statusString = 'Получен таймаут связи со станцией';
                                break;
                            case 14:
                                statusString = 'Получен таймаут связи BMS';
                                break;
                            case 15:
                                statusString = 'Ошибка контроллера';
                                break;
                            default:
                                statusString = 'Нет связи!';
                                break;
                        }
                        tableStatus.rows[0].cells[1].innerText = statusString;
                        break;
                    case 1:
                        let errorString = '';
                        if (data[i] != 0){
                            let binaryString = data[i].toString(2).split('').reverse();
                            if (binaryString[1] == '1'){
                                errorString += 'Ошибка блокировки разъема\n';
                            }
                            if (binaryString[2] == '1'){
                                errorString += 'Ошибка станции\n';
                            }
                            if (binaryString[3] == '1'){
                                errorString += 'Ошибка BMS\n';
                            }
                            if (binaryString[4] == '1'){
                                errorString += 'Разрыв связи по CAN или Modbus\n';
                            }
                            if (binaryString[5] == '1'){
                                errorString += 'Ошибка физического соединения\n';
                            }
                            if (binaryString[6] == '1'){
                                errorString += 'Получен таймаут связи с машиной\n';
                            }
                            if (binaryString[7] == '1'){
                                errorString += 'Получен таймаут связи BMS\n';
                            }
                            if (binaryString[8] == '1'){
                                errorString += 'Ошибка измерения температуры кабеля\n';
                            }
                            if (binaryString[9] == '1'){
                                errorString += 'Ошибка измерения температуры в точке\n';
                            }
                            if (binaryString[10] == '1'){
                                errorString += 'Несоответствие напряжение заряда\n';
                            }
                            if (binaryString[11] == '1'){
                                errorString += 'Невозможно зарядить по U\n';
                            }
                            if (binaryString[12] == '1'){
                                errorString += 'Некорректрое напряжение на выходе\n';
                            }
                            if (binaryString[13] == '1'){
                                errorString += 'Ошибка сопротивления изоляции\n';
                            }
                            if (binaryString[14] == '1'){
                                errorString += 'Несоответствующие параметры зарядки\n';
                            }
                        }
                        tableStatus.rows[1].cells[1].innerText = errorString;
                        break;
                    case 2: case 5:
                        tableStatus.rows[i].cells[1].innerText = data[i] + ' В';
                        break;
                    case 3:
                        if (data[i] != 0){
                            tableStatus.rows[3].cells[1].innerText = 'Включена';
                        }
                        else {
                            tableStatus.rows[3].cells[1].innerText = 'Выключена';
                        }
                        break;
                    case 4:
                        tableStatus.rows[4].cells[1].innerText = data[i] + ' А';
                        break;
                    case 6:
                        tableCharging.rows[i - 6].cells[1].innerText = data[i] + ' В';
                        break;
                    case 7:
                        tableCharging.rows[i - 6].cells[1].innerText = data[i] + ' А';
                        break;
                    case 8:
                        tableCharging.rows[i - 6].cells[1].innerText = data[i] + ' %';
                        break;
                    case 9:
                        if (data[i] == 0){
                            tableCharging.rows[i - 6].cells[1].innerText = 'Зарядка запрещена';
                        }
                        else {
                            tableCharging.rows[i - 6].cells[1].innerText = 'Зарядка разрешена';
                        }
                    case 10:
                        softwareVersion.innerHTML = 'Версия ПО: ' + data[i];
                        break;
                    case 11:
                        tableCharging.rows[i - 7].cells[1].innerText = data[i] + ' А';
                        break;
                    case 12:
                        tableCharging.rows[i - 7].cells[1].innerText = data[i] + ' В';
                        break;
                    default:
                        break;
                }
            }
        });
    }
    function holdingTable(){
        let asyncResult = getTableData('/holding_table.bin');
        asyncResult.then((buffer) => {
            let data = new Int16Array(buffer);
            for (let i = 1; i < 11; i++){
                switch(i){
                    case 0:
                        switch(data(i)){
                            case 0:
                                tableHolding.rows[0].cells[1].style.backgroundColor = 'white';
                                break;
                            case 1:
                                tableHolding.rows[0].cells[1].style.backgroundColor = 'red';
                                break;
                            case 2:
                                tableHolding.rows[0].cells[1].style.backgroundColor = 'green';
                                break;
                            case 3:
                                tableHolding.rows[0].cells[1].style.backgroundColor = 'blue';
                                break;
                            default:
                                break;
                        }
                        break;
                    case 1:
                        switch(data[i]){
                            case 0: // ERROR_MODE
                                tableHolding.rows[1].cells[1].innerText = 'ERROR';
                                break;
                            case 15: // STANDBY_MODE
                                tableHolding.rows[1].cells[1].innerText = 'STANDBY';
                                break;
                            case 1: // IDLE_MODE
                                tableHolding.rows[1].cells[1].innerText = 'IDLE';
                                break;
                            case 2: // POWER_SUPPLY_MODE
                                tableHolding.rows[1].cells[1].innerText = 'POWER_SUPPLY';
                                break;
                            default:
                                tableHolding.rows[1].cells[1].innerText = 'Нет связи с контроллером';
                                break;
                        }
                        break;
                    case 4:
                        switch(data[i]){
                            case 1:
                                tableHolding.rows[2].cells[1].innerText = 'Работа разрешена';
                                break;
                            case 2:
                                tableHolding.rows[2].cells[1].innerText = 'Работа запрещена';
                                break;
                            default:
                                tableHolding.rows[2].cells[1].innerText = 'Не определено';
                                break;
                        }
                        break;
                    case 5:
                        let infoString = 'Инфо: ';
                        if (data[i] == 0){
                            infoString += 'ОК!';
                        }
                        else {
                            let binaryString = data[i].toString(2).split('').reverse();
                            // Warning flags
                            if (binaryString[8] == '1'){
                                infoString += 'Несовместимая тяговая батарея\n';
                            }
                            if (binaryString[9] == '1'){
                                infoString += 'Необходима вентиляция\n';
                            }
                            if (binaryString[10] == '1'){
                                infoString += 'Отсутствует УКИ\n';
                            }
                            if (binaryString[11] == '1'){
                                infoString += 'Тест УКИ\n';
                            }
                            if (binaryString[12] == '1'){
                                infoString += 'ИНВы включены\n';
                            }
                            if (binaryString[13] == '1'){
                                infoString += 'Номинальное питание подается\n';
                            }
                            // Error flags
                            if (binaryString[0] == '1'){
                                infoString += 'Все ИНВы нерапобоспособны\n';
                            }
                            if (binaryString[1] == '1'){
                                infoString += 'Нет обмена по CAN\n';
                            }
                            if (binaryString[4] == '1'){
                                infoString += 'Пробой изоляции зарядного кабеля\n';
                            }
                            if (binaryString[5] == '1'){
                                infoString += 'УКИ неисправно\n';
                            }
                            if (binaryString[6] == '1'){
                                infoString += 'Ошибка питания ИНВов';
                            }
                        }
                        tableHolding.rows[3].cells[1].innerText = infoString;
                        break;
                    case 6: case 8:
                        tableHolding.rows[i - 2].cells[1].innerText = data[i] + ' В';
                        break;
                    case 7: case 9:
                        tableHolding.rows[i - 2].cells[1].innerText = data[i] + ' А';
                        break;
                    default:
                        break;
                }
            }
        })
    }
    async function getRebootMessage(){
        const response = await fetch('/reboot', {method: 'POST', headers: {
            'Content-Type': 'text/html'
        }});
        if (!response.ok){
            return new Error ('Сервер не отвечает!');
        }
        let result = await response.text();
        return result;
    }
    function rebooting(){
        naviButton.disabled = true;
        naviButton2.disabled = true;
        clearInterval(inputTableInterval);
        clearInterval(holdingTableInterval);
        let result = getRebootMessage();
        result.then((text) => {
            if (text == 'OK!'){
                document.getElementById('status_text').innerText = 'Устройство перезагрузится через 5 сек!';
                div.removeAttribute('hidden');
                let animation = div.animate([{'bottom': '-30px'}, {'bottom': '0px'}], 600);
                animation.addEventListener('finish', () => div.style.bottom = '0px')
                setTimeout(() => window.location.replace('/'), 7500);
            }
        });
        result.catch((error) => window.alert(error));
    }
    naviButton.addEventListener('click', () => window.location.replace('/update'));
    naviButton2.addEventListener('click', () => {
        let conf = confirm('Вы действительно хотите перезагрузить устройство?');
        if (conf == true) rebooting();
    });
    
    let inputTableInterval = setInterval(() => inputTable(), 1000);
    let holdingTableInterval = setInterval(() => holdingTable(), 1009);
}