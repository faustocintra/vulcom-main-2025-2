import React from 'react'
import Typography from '@mui/material/Typography'

export default function Homepage() {
  const [ls, setLs] = React.useState([])

  React.useEffect(() => {
    const _ls = []
    for(let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i)
      const value = window.localStorage.getItem(key)
      _ls.push({ [key]: value })
    }
    console.log(_ls)
    setLs(_ls)
  }, [])

  return(
    <>
      <Typography variant="h1" gutterBottom>
        Projeto VULCOM
      </Typography>
      
      <Typography>
        Sistema para análise e estudo de vulnerabilidades comuns  
      </Typography>

      <Typography variant="h6">
        Exposição de valores do <em>local storage</em>
        <Typography variant="caption" style={{ fontFamily: 'monospace '}}>
          {
            ls.map(kv => (
              <p>{Object.keys(kv)[0]} =&gt; {kv[Object.keys(kv)[0]]}</p>
            ))
          }
        </Typography>
      </Typography>

      <Typography variant="h6">
        Exposição de <em>cookies</em>
        <Typography variant="caption" style={{ fontFamily: 'monospace '}}>
          <p>{ document.cookie }</p>  
        </Typography>
      </Typography>
      
    </>
  )
}