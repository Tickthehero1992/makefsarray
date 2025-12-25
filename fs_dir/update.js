window.onload = function(){
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
    var state_con = 0;
    var crc = 0;
    async function getAsyncResponse(file, size_f, url){
        console.log('url ask..', url);
        var ap32 = await file.arrayBuffer();
        const u8arr = new Uint8Array(ap32);
        console.log('info ', u8arr);
        for(var i=0; i<size_f; i++)
        {
            crc+=u8arr[i];
        }
        //u8arr.forEach((elem) => {crc+=elem;})
        console.log('crc', crc);

        let result =  await fetch(url, {method: 'POST', signal: AbortSignal.timeout(5000), body: file, headers:{
           'Content-Type': 'application/octet-stream',
        }}).then((response) => {if(!response.ok){ alert('Ошибка обновления! Контроллер будет перезагружен'); state_con = 1; }console.log(response);}).catch((err)=>{console.log(err)});
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

        var arr = new Uint8Array(12);
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
                await getAsyncResponse(file.slice(offset, offset+chunkSize), chunkSize, url);
                if(state_con == 1)
                {
                    buttonBlock(false);
                    break;
                }
                size -= chunkSize;
                progress_bar(chunk/(chunks - 1) * 100);
                chunk++;
                await new Promise(r => setTimeout(r, 300));
           }
           console.log('crc', crc)
           const arr4 = numToUint8Array(crc);
           arr.set(arr4, 8);
           await fetch("/update_statistic", {method: 'POST', signal: AbortSignal.timeout(5000), body: arr, headers:{
           'Content-Type': 'application/octet-stream',
                }}).then((response) => {console.log(response);}).catch((err)=>{ console.log(err)});
           await new Promise(r => setTimeout(r, 300));
           await getRebootMessage();
           alert("Установка обновлений прошла успешно, контроллер будет перезагружен");
           await new Promise(r => setTimeout(r, 4000));
           window.location.replace('/')

    }

    async function getRebootMessage(){
        const response = await fetch('/reboot', {method: 'POST', headers: {
            'Content-Type': 'text/html'
        }});
        let result = await response.text();
        return response.status;
    }
    function rebooting(){
        let conf = confirm('Вы действительно хотите перезагрузить устройство?');
        if (conf == true) {
            buttonBlock(true);
            let result = getRebootMessage();
            result.then((response) => {
                console.log(response);
                if(response == 404)
                {
                 alert('ERROR Not found!');
                }
                if(response == 200)
                {
                    alert("Перезагрузка контроллера ... ");
                    window.location.replace('/');
                }
            });
            result.catch((error) => window.alert(error));
        }
    }

    // Making the buttons clickable after downloading the Javascript file
    window.addEventListener('resize', scroll);
    firmFile.addEventListener('change', () => {
        (firmFile.value != '') ? firmSend.disabled = false : firmSend.disabled = true;
    })
    firmForm.addEventListener('submit', (e) => {
        e.preventDefault();
    });

    firmSend.onclick = function(){
     setupUpdate(firmFile.files[0], '/firmware_update');
    };
//    naviButton2.onclick = function(){
//        getRebootMessage();
//    }
    naviButton.addEventListener('click', () => window.location.replace('/update'));
    naviButton2.addEventListener('click', rebooting);
};