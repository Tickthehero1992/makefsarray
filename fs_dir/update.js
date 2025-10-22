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
        spiffsSend.disabled = value;
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
        }})

        return result;
    }
    function setupUpdate(file, url){
        //buttonBlock(true);
        //alert(file.size)
        var size = file.size;
        var chunkSize = 256;
        var fileSize = file.size;
        var chunks = Math.ceil(file.size/chunkSize,chunkSize);
        var chunk = 0;
        console.log('current size', size);
        console.log('current size', chunks);
        let res;
         while (chunk < chunks) {
                var offset = chunk*chunkSize;
                console.log('current chunk..', chunk);
//                console.log('offset...', chunk*chunkSize);
//                console.log('file blob from offset...', offset)
//                console.log("size", size);
                if(size < chunkSize){
                  chunkSize = size;
                }
                console.log('res is ',res)
                getAsyncResponse(file.slice(offset, chunkSize), url).then(() => {
                    size -= chunkSize;
                    chunk++;
                })



           }
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