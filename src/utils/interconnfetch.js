export default class FetchClient{
    static "__interconnModule__" = true;
    static name = 'fetch';
    constructor({ addListener, send, addEventListener }){
        this.requests = new Map()
        this.send = send
        addListener((data)=>{
            const {resp,id}  = data
            this.onResponse(id,resp)
        })
        addEventListener((event)=>{
            if(event!=="open"){
                this.requests.forEach((request)=>{
                    request?.reject?.(event)
                })
            }
        })
    }
    /**
     * 发起一个请求
     * @param {string} url - 请求的目标 URL
     * @param {{method?: string,headers?: HeadersInit,body?:string;}} options - 请求的配置选项
     * @returns {Promise<Response>} 返回一个 Promise 对象，该对象会在请求完成时 resolve 或 reject
     */
    fetch(url, options){
        const id = url + Math.random().toFixed(5)
        let resolve, reject
        const promise = new Promise((res, rej) => {
            resolve = res
            reject = rej
        })
        this.send({
            id,
            url,
            options
        }).catch((err)=>{
            this.requests.delete(id)
            reject(err)
        })
        this.requests.set(id,{ resolve, reject })
        return promise
    }
    onResponse(id, data){
        const request = this.requests.get(id)
        if(request){
            request.resolve(new Response(data.body, data.headers, data.status))
            this.requests.delete(id)
        }
    }
}
export class Response {
    constructor(body, headers, status) {
        this.body = body
        this.headers = headers
        this.status = status
    }
    json() { return JSON.parse(this.body) }
    text() { return this.body }
}