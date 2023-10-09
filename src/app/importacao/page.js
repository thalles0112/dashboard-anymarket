'use client'
import axios from "axios"
import { produce } from "immer"
import { useEffect, useState } from "react"
import {LuFileSpreadsheet} from 'react-icons/lu'
import { backend } from "../requests"
import {AiOutlineArrowLeft} from 'react-icons/ai'
import Link from "next/link"
function PlanilhaCard({planilha, idx, removeFromListFunction}){
    const [processando, setProcessando] = useState(false)

    async function deletePlanlihaHandler(){
        const resp = await axios.delete(`${backend}/planilha/${planilha.id}`)
        if (resp.data){
            removeFromListFunction(idx)
        }
        
    }

    async function processPlanilhaHandler(){
        setProcessando(true)
        const resp = await axios.get(`${backend}/processar/${planilha.id}`)
        if (resp.data){
            console.log(resp.data)
            setProcessando(false)
        }
    }

    return(
        <li className="p-1 my-2 w-full">
            <div className="flex justify-between items-center w-full">
                <div className="flex items-center w-6/12">
                    <LuFileSpreadsheet size={24} color="#00cc00"/>
                    <label className="break-all w-full">{planilha.title}</label>
                </div>
                {processando
                    ?<div className="p-2 border">Aguarde...</div>
                    :<div className="flex flex-nowrap justify-end gap-1 w-4/12"><button onClick={deletePlanlihaHandler} className="p-3 border border-red">Deletar</button><button onClick={processPlanilhaHandler} className="p-3 border">Processar</button></div>
                
                }
                
            </div>
        </li>
    )
}

export default function Importacao(){
    const [file, setFile] = useState(null)
    const [planilhas, setPlanilhas] = useState([])
    async function postPlanilha(){
        const formData = new FormData()
        formData.append('file', file)

        const resp = await axios.post(`${backend}/planilha/`, formData, {
            'headers':{
                'Content-Type': 'multipart/form-data'
            }
        })
        if (resp.data){
            const nextState = produce((planilhas, draft=>{
                draft.push(resp.data)
            }))
            setPlanilhas(nextState)
        }
    }

    useEffect(()=>{
        async function getPlanilhas(){
            const resp = await axios.get(`${backend}/planilha`)
            if(resp.data){
                setPlanilhas(resp.data)
            }
        }
        getPlanilhas()
    },[])

    function removeFromListFunction(idx){
        const nextState = produce((planilhas, draft=>{
            draft.splice(idx, 1)
        }))

        setPlanilhas(nextState)
    }

    return(
        <main className="h-screen overflow-y-hidden">
            <div className="border p-2 flex items-center justify-around h-1/5">
            <div className="m-2">
            <Link className="border rounded m-2 flex flex-col items-center p-2" href={'/'}>
                <AiOutlineArrowLeft/>
                <p>Voltar</p>
            </Link>
            </div>
                <div className="flex flex-col">
                    <input className="file-input" onChange={(e)=>setFile(e.target.files[0])} type="file"/>
                    <label htmlFor="fileInput" className="custom-file-input-label">Insira aqui uma planilha de vendas da anymarket</label>
                    {file && file.name?<label>{file.name}</label>:''}
                    {file !== null
                    ?<button onClick={postPlanilha} className="px-5 py-3 border rounded">Enviar</button>
                    :<label></label>
                    }
                </div>
                
                
            </div>
            
            <div className="h-4/5">
                <ul className="overflow-y-scroll h-full border">
                    {planilhas.map((planilha, idx)=>{
                        return(
                            <PlanilhaCard key={idx} planilha={planilha} idx={idx} removeFromListFunction={removeFromListFunction}/>
                        )
                    })}
                </ul>
            </div>
        </main>
    )
}