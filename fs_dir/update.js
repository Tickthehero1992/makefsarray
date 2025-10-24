window.onload = function(){
   // if (window.location.search != '') window.history.pushState(null, '', '/');
    let statusBar = document.getElementById('status_bar');
    let logsDiv = document.getElementById('logs');
    let firmForm = document.getElementById('firm_form')
    let firmFile = firmForm.querySelector('input[type="file"]');
    let firmSend = firmForm.querySelector('input[type="submit"]');
    let naviButton = document.querySelectorAll('#navi > button')[0];
    let naviButton2 = document.querySelectorAll('#navi > button')[1];
    let isModifed = false;
    naviButton.disabled = false;
    naviButton2.disabled = false;
    firmFile.disabled = false;
    function buttonBlock(value){
        naviButton.disabled = value;
        naviButton2.disabled = value;
        firmFile.disabled = value;
        firmSend.disabled = value;
    }
    function rotateSlash(){
        let statusText = document.getElementById('status_text');
        switch(statusText.innerText[statusText.innerText.length-1]){
            case '/':
                statusText.innerText = statusText.innerText.replace('/', '—');
                break;
            case '—':
                statusText.innerText = statusText.innerText.replace('—', '\\');
                break;
            case '\\':            
                statusText.innerText = statusText.innerText.replace('\\', '|');
                break;
            case '|':
                statusText.innerText = statusText.innerText.replace('|', '/');
                break;
            default:
                return;
        }
    }
    async function getAsyncResponse(file, url){

//        statusBar.removeAttribute('hidden');
//        clearInterval(logging);
//        let animation = statusBar.animate([{'bottom': '-30px'}, {'bottom': '0px'}], 600);
//        animation.addEventListener('finish', () => statusBar.style.bottom = '0px');
//        let rotating = setInterval(() => rotateSlash(), 350);
        console.log('url ask..', url);

        let result =  await fetch(url, {method: 'POST', signal: AbortSignal.timeout(5000), body: file, headers:{
           'Content-Type': 'application/octet-stream',
        }}).then((response) => {console.log(response);}).catch((err)=>{ console.log(err)});
        //console.log('reseponse', result);
    }

    function numToUint8Array(num) {
        let arr = new Uint8Array(4);

        for (let i = 0; i < 4; i++) {
                arr[i] = num % 256;
                num = Math.floor(num / 256);
                }

        return arr;
        }

function progress_bar(percent){
    var elem = document.getElementById("progressBar");
    console.log('percent,',percent);
    elem.style.width = percent + "%";
    elem.innerHTML = Number(percent.toFixed(2)) + "%";
}

    async function setupUpdate(file, url){
        buttonBlock(true);
        //alert(file.size)
        var size = file.size;
        var chunkSize = 256;
        var fileSize = file.size;
        var chunks = Math.ceil(file.size/chunkSize,chunkSize);
        var chunk = 0;
        const arr2 = numToUint8Array(size);
        const arr3 = numToUint8Array(chunks)
        //const arr = new Uint8Array([chunks]);
        var arr = new Uint8Array(8);
        arr.set(arr3);
        arr.set(arr2, 4);
        console.log('current size', size);
        console.log('current size', chunks);
        console.log('arr', arr);
        let res;
        while (chunk < chunks) {
                var offset = chunk*chunkSize;
                console.log('current chunk..', chunk);
                if(size < chunkSize){
                  chunkSize = size;
                }
                await getAsyncResponse(file.slice(offset, offset+chunkSize), url);
                size -= chunkSize;
                progress_bar(chunk/chunks * 100);
                chunk++;
                await new Promise(r => setTimeout(r, 300));
           }

           await fetch("/update_statistic", {method: 'POST', signal: AbortSignal.timeout(5000), body: arr, headers:{
           'Content-Type': 'application/octet-stream',
                }}).then((response) => {console.log(response);}).catch((err)=>{ console.log(err)});
           await getRebootMessage();
           alert("Done");
//        result.then(() => {
//            document.getElementById('status_text').innerText = 'Обновление установлено успешно - устройство перезагрузится через 5 сек!';
//            setTimeout(() => {
//                window.location.replace('/');
//            }, 7500);
//        }).catch((error) => {
//            window.alert(error);
//           // window.location.reload();
//        })
    }
    function logsOutput(){
        let response = getAsyncLogs();
        response.then((result) => {
            let messages = result.split(';');
            messages = messages.slice(0, messages.length - 1);
            if (messages[0] != ''){
                let prevLastLog;
                let prevLastTick = 0;
                if (logsDiv.children.length > 0){
                    prevLastLog = logsDiv.querySelector('h5:last-child');
                    prevLastTick = parseInt(prevLastLog.innerText.match(/\(([^)]+)\)/)[1]);
                }
                messages.forEach((message) => {
                    let newLog;
                    let messageTick = parseInt(message.match(/\(([^)]+)\)/)[1]);
                    if ((prevLastTick > 0) || (prevLastTick - messageTick > 10000)) { // 2 условие говорит нам о том, что цикл тиков начался заново
                        if (messageTick > prevLastTick){
                            newLog = document.createElement('h5');
                            newLog.innerText = message;
                            logsDiv.append(newLog);
                            if (logsDiv.children.length > 1000){
                                logsDiv.querySelector('h5:first-child').remove();
                            }
                        }
                    }
                    else {
                        newLog = document.createElement('h5');
                        newLog.innerText = message;
                        logsDiv.append(newLog);
                    }
                });
            }
            // console.log('logsOutput is complete!');
        }).catch((error) => console.log(error));
    }
    async function getRebootMessage(){
        const response = await fetch('/reboot', {method: 'POST', headers: {
            'Content-Type': 'text/html'
        }});
        if (!response.ok){
            return new Error('Сервер не отвечает!');
        }
        let result = await response.text();
        return result;
    }
    function rebooting(){
        let conf = confirm('Вы действительно хотите перезагрузить устройство?');
        if (conf == true) {
            buttonBlock(true);
            clearInterval(logging);
            let result = getRebootMessage();
            result.then((text) => {
                if (text == 'OK!'){
                    document.getElementById('status_text').innerText = 'Устройство перезагрузится через 5 сек!';
                    statusBar.removeAttribute('hidden');
                    let animation = statusBar.animate([{'bottom': '-30px'}, {'bottom': '0px'}], 600);
                    animation.addEventListener('finish', () => statusBar.style.bottom = '0px')
                    setTimeout(() => window.location.replace('/'), 7500);
                }
            });
            result.catch((error) => window.alert(error));
        }
    }
    function scroll(){
        logsDiv.scrollTop = logsDiv.scrollHeight;
        isModifed = true;
    }
    // Making the buttons clickable after downloading the Javascript file
    logsDiv.addEventListener('DOMSubtreeModified', scroll);
    logsDiv.addEventListener('scrollend', () => {
        if ((logsDiv.scrollTop < logsDiv.scrollHeight - logsDiv.offsetHeight - 2) && (isModifed == true)) { 
            logsDiv.removeEventListener('DOMSubtreeModified', scroll);
            window.removeEventListener('resize', scroll);
        }
    })
    window.addEventListener('resize', scroll);
    firmFile.addEventListener('change', () => {
        (firmFile.value != '') ? firmSend.disabled = false : firmSend.disabled = true;
    })
    firmForm.addEventListener('submit', (e) => {
        e.preventDefault();
    });

    firmSend.onclick = function(){
        setupUpdate(firmFile.files[0], '/firmware_update');
    }

    //naviButton.addEventListener('click', () => window.location.replace('/'));
   // naviButton2.addEventListener('click', rebooting);
};