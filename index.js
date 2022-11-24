const inputElement = document.getElementById("file-reader");
const inputContent = document.getElementById("file-content");

inputElement.addEventListener("change", handleFiles, false);


function handleFiles() {
  const fileList = this.files[0]; /* now you can work with the file list */
  if(fileList){
    var reader = new FileReader();
    reader.readAsText(fileList);

    reader.onload = function (evt) {
        const chatResult = evt.target.result
        

        const arrayChat = chatResult.split("\r\n")
        const chatContent = arrayChat.slice(1, -1)
        const chatTime = chatContent.reduce((total, current) => {
            const time = current.split(": ")[0]
            total.push(time)
            return total;
        }, [])
        const chatTimeDiff = chatTime.reduce((total, current, idx) => {
            const currentTime = current.split(": ")[0]
            const currentName = currentTime.split("] ")[1]

            let next = ""

            if(idx < chatTime.length - 1){
                next = chatTime[idx + 1]
            }

            const nextTime = next.split(": ")[0]
            const nextName = nextTime.split("] ")[1]

            if(currentName === nextName){
                return total
            }

            total.push(current)
            return total
        }, [])
        const chatTimeOnly = chatTimeDiff.reduce((total, current) => {
            const time = current.split("] ")[0].split("[")[1]

            const date = time.split("/")[0]
            const month = time.split("/")[1]
            const year = time.split("/")[2].replaceAll(".", ":")

            const newTime = `${month}/${date}/${year}`
            const timeStamp = Date.parse(newTime)/1000
            total.push(timeStamp)
            return total
        }, [])

        const responseArrayTime = chatTimeOnly.reduce((total, current, idx) => {
            const isDealer = idx % 2 > 0
            if(isDealer && idx < chatTimeOnly.length - 1){
                total.dealer.push(current - chatTimeOnly[idx - 1])
                return total
            }

            if(!isDealer && idx < chatTimeOnly.length - 1 && idx > 0){
                total.admin.push(current - chatTimeOnly[idx - 1])
                return total
            }

            return total

        }, {dealer : [], admin: []})

        const averageAdminResponse = Math.round(responseArrayTime.admin.reduce((a,b) => a + b , 0) / responseArrayTime.admin.length)
        const averageDealerResponse = Math.round(responseArrayTime.dealer.reduce((a,b) => a + b , 0) / responseArrayTime.dealer.length)
        

        const readeableResponseTime = {
            admin : new Date(averageAdminResponse * 1000).toISOString().substr(11, 8),
            dealer : new Date(averageDealerResponse * 1000).toISOString().substr(11, 8),
        }

        const renderResponseTime = (time) => {
            const arrayTime = time.split(":")
            return `${arrayTime[0]} jam ${arrayTime[1]} menit ${arrayTime[2]} detik`
        }


        const adminName = chatContent[0].split(":")[0].split("] ")[1]
        let dealerName = ""

        chatContent.every((chat) => {
            const name = chat.split(":")[0].split("] ")[1]
            if(adminName !== name){
                dealerName = name
                return false
            }
            return true
        })


        inputContent.
        innerHTML = `<p>Admin : ${adminName} / <b>Response Time ${renderResponseTime(readeableResponseTime.admin)} </b></p> 
        <p>Dealer : ${dealerName} / <b>Response Time ${renderResponseTime(readeableResponseTime.dealer)}</p>`;

        // chatTimeDiff.forEach((chat) => console.log(chat))
        // console.log(responseArrayTime)
        // console.log({averageDealerResponse, averageAdminResponse, readeableResponseTime})
    }
    reader.onerror = function (evt) {
        inputContent.innerHTML = "error reading file";
    }
  }
}