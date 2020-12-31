export class FileManager {
    private static data: any
    private offset: number = 0
    constructor(){
        if(FileManager.data)return
        const xhr = new XMLHttpRequest();
        xhr.open('GET', "asset/stage/stage.json", true);
        xhr.onreadystatechange = () => {
            if(xhr.readyState === 4 && xhr.status === 200){
                FileManager.data = JSON.parse(xhr.responseText)
            }
        }
        setTimeout(() => xhr.send(null), 100)
    }
}