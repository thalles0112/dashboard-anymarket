'use client'
import { useEffect, useState } from 'react'
import './styles.css'
import {AiOutlineMenu} from 'react-icons/ai'
import axios from 'axios'
import { produce } from 'immer'
import Link from 'next/link'

import { backend } from './requests'

export default function Home() {
  const [menu, setMenu] = useState(false)
  const [resumo, setResumo] = useState({'marketplaces': [], 'resumo':{'pedidos':0, 'valor':0}, 'mais_vendidos':[]})
  const [cancelamentos, setCancelamentos] = useState([])
  const [selectedMarketPlaces, setSelectedMarketplaces] = useState([])
  const [data_inicio, setDataInicio] = useState(new Date().toISOString())
  const [data_final, setDataFinal] = useState(new Date().toISOString())
  const [marketplaces, setMarketplaces] = useState([])
  useEffect(()=>{
    async function getMarketplacesHandler(){
      const marketplaces = await axios.get(`${backend}/get-marketplaces`)
      if (marketplaces.data){
        setMarketplaces(marketplaces.data)
      }
    }
    getMarketplacesHandler()
  },[])
  


  
  function setMenuHandler(){
    setMenu(!menu)
  }

  async function getResumoHandler(){
    const resp = await axios.post(`${backend}/resumo/`, {
      'data-inicio': data_inicio,
      'data-final': data_final,
      'marketplaces': [
        ...selectedMarketPlaces
      ]
    })
    if(resp.data){
      setResumo(resp.data)
    }

    const c_resp = await axios.post(`${backend}/cancelamentos/`, {
      'data-inicio': data_inicio,
      'data-final': data_final,
      'marketplaces': [
        ...selectedMarketPlaces
      ],
    })
    if(c_resp.data){
      setCancelamentos(c_resp.data)
    }
  }

  function setSelectedMarketplacesHandler(marketplace){
    if(selectedMarketPlaces.includes(marketplace)){
      const marketplaceIndex = selectedMarketPlaces.indexOf(marketplace)
      const nextState = produce(selectedMarketPlaces, draft=>{
        draft.splice(marketplaceIndex, 1)
      })

      setSelectedMarketplaces(nextState)

    }
    else{
      const nextState = produce(selectedMarketPlaces, draft=>{
        draft.push(marketplace)
      })

      setSelectedMarketplaces(nextState)
      
    }

  }

  

  return (
    <main className='h-screen'>
      <header className='h-20 w-full flex justify-center'>
        <div className='w-10/12 flex items-center text-white'>
              <button onClick={setMenuHandler} className='text-white' ><AiOutlineMenu size={24}/></button>
              <h1 className='text-white' >Dash AnyMarket</h1>
              <Link className='mx-5' href={'importacao'}>Importação por planilha</Link>
        </div>
      </header>

    <div className='h-20 w-full flex justify-center'>
      <div className='page-content w-10/12  flex items-center h-full flex flex-col'>
        
        <aside className={`filter-menu fixed right-0 h-full top-0 ${menu?'open':''}`}>
          <ul>
            <li>
              <h2>Filtrar Período</h2>
              <div className='text-black'>
                <input onChange={e=>{setDataInicio(e.target.value)}} type='date'/> <span>até</span> <input onChange={e=>{setDataFinal((e.target.value))}} type='date'/>
              </div>
            </li>

            <li>
              <h2>Filtrar Marketplace</h2>
              <div className='text-black flex flex-col justify-flex-start'>
                {marketplaces.map((marketplace, idx)=>{
                  return(
                    <div>
                      <input key={idx} type="checkbox" onChange={()=>setSelectedMarketplacesHandler(marketplace.marketplace)}/><span>{marketplace.marketplace}</span>
                    </div>
                  )
                })}
                
                  
              </div>
            </li>


          </ul>
          <button className='border rounded px-3 py-2' onClick={getResumoHandler}>Filtrar</button>
        </aside>
   
        
        <div className='panel-main w-6/12'>
          <div className='panel-header'><h2>Resumo</h2></div> 
          <table className="w-full">
            <tbody>
            <tr className="w-full">
              <td>Pedidos</td>
              <td>{resumo.resumo.pedidos}</td>
            </tr>

            <tr>
              <td>Ticket Médio</td>
              <td>R$ {(resumo.resumo.valor / resumo.resumo.pedidos).toFixed(2)}</td>
            </tr>

            <tr>
              <td>Valor Total</td>
              <td>R$ {resumo.resumo.valor.toFixed(2)}</td>
            </tr>
            </tbody>
          </table>

        </div>



        <div className='panel-main w-6/12'>
          <div className='panel-header'><h2>Top Marketplaces</h2></div> 
          <table  id='topMktp'>
            <tbody>
            <tr className='w-full'>
              <th>Marketplace</th>
              <th>Vendas</th>
              <th>Valor</th>
              <th>Ticket Médio</th>
            </tr>
            {
              resumo.marketplaces.map((mktp, idx)=>{
                return(
                  <tr key={idx} className='w-full'>
                    <td>{mktp.marketplace}</td>
                    <td>{mktp.pedidos}</td>
                    <td>R$ {mktp.valor_total.toFixed(2)}</td>
                    <td>R$ {(mktp.valor_total.toFixed(2) / mktp.pedidos).toFixed(2)}</td>
                  </tr>
                )
              })
            }
            
            </tbody>
          </table>
        </div>


        <div className='panel-main w-6/12'>
          <div className='panel-header'><h2>Cancelamentos</h2> 
           
          </div> 
          <table  id='topMktp'>
            <tbody>
            <tr className='w-full'>
              <th>Marketplace</th>
              <th>Pedidos Cancelados</th>
              <th>Valor</th>
              <th>Ticket Médio</th>
            </tr>
            {
              cancelamentos.map((mktp, idx)=>{
                return(
                  <tr key={idx} className='w-full'>
                    <td>{mktp.marketplace}</td>
                    <td>{mktp.pedidos}</td>
                    <td>R$ {mktp.valor_total.toFixed(2)}</td>
                    <td>R$ {(mktp.valor_total.toFixed(2) / mktp.pedidos).toFixed(2)}</td>
                  </tr>
                )
              })
            }
            
            </tbody>
          </table>
          </div>         


          <div className='panel-main w-6/12'>
          <div className='panel-header'><h2>Produtos mais vendidos</h2></div> 
            <table  id='topMktp'>
              <tbody>
              <tr className='w-full'>
                <th>Sku</th>
                <th>Título</th>
                <th>Qtd. Pedidos</th>
              </tr>

              {
                resumo.mais_vendidos.slice(0,10).map((produto, idx)=>{
                  return(
                      <tr key={idx}>
                        <td>{produto.sku}</td>
                        <td>{produto.titulo}</td>
                        <td>{produto.qtd}</td>
                      </tr>
                  )
                })
              }
              </tbody>
            </table>
          </div>       


           
      </div>
    </div>
      
    </main>
  )
}
