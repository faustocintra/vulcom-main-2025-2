import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'
import { parseISO, isBefore, isAfter, format } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import React from 'react'
import InputMask from 'react-input-mask'
import { useNavigate, useParams } from 'react-router-dom'
import myfetch from '../../lib/myfetch'
import useConfirmDialog from '../../ui/useConfirmDialog'
import useNotification from '../../ui/useNotification'
import useWaiting from '../../ui/useWaiting'

export default function CarForm() {
  const formDefaults = {
    brand: '',
    model: '',
    color: '',
    year_manufacture: '',
    imported: false,
    plates: '',
    selling_date: null,
    selling_price: '',
    customer_id: ''
  }

  // Data de abertura da loja (20/03/2020)
  const storeOpeningDate = new Date(2020, 2, 20) // Mês é 0-based (2 = março)

  const [state, setState] = React.useState({
    car: { ...formDefaults },
    formModified: false,
    customers: [],
    inputErrors: {},
    fieldWarnings: {}, // Novos avisos específicos por campo
  })
  const { car, customers, formModified, inputErrors, fieldWarnings } = state

  const params = useParams()
  const navigate = useNavigate()

  const { askForConfirmation, ConfirmDialog } = useConfirmDialog()
  const { notify, Notification } = useNotification()
  const { showWaiting, Waiting } = useWaiting()

  const colors = [
    { value: 'AMARELO', label: 'AMARELO' },
    { value: 'AZUL', label: 'AZUL' },
    { value: 'BRANCO', label: 'BRANCO' },
    { value: 'CINZA', label: 'CINZA' },
    { value: 'DOURADO', label: 'DOURADO' },
    { value: 'LARANJA', label: 'LARANJA' },
    { value: 'MARROM', label: 'MARROM' },
    { value: 'PRATA', label: 'PRATA' },
    { value: 'PRETO', label: 'PRETO' },
    { value: 'ROSA', label: 'ROSA' },
    { value: 'ROXO', label: 'ROXO' },
    { value: 'VERDE', label: 'VERDE' },
    { value: 'VERMELHO', label: 'VERMELHO' },
  ]

  const plateMaskFormatChars = {
    9: '[0-9]',
    $: '[0-9A-J]',
    A: '[A-Z]',
  }

  const currentYear = new Date().getFullYear()
  const minYear = 1960
  const years = []
  for (let year = currentYear; year >= minYear; year--) {
    years.push(year)
  }

  function handleFieldChange(event) {
    const { name, value, type, checked } = event.target
    const carCopy = { ...car }
    
    if (type === 'checkbox') {
      carCopy[name] = checked
    } else {
      carCopy[name] = value
    }
    
    // Validação em tempo real para alguns campos
    const warnings = { ...fieldWarnings }
    
    if (name === 'selling_date' && value) {
      const selectedDate = new Date(value)
      const today = new Date()
      
      if (isBefore(selectedDate, storeOpeningDate)) {
        warnings.selling_date = `⚠️ Data anterior à abertura da loja (${format(storeOpeningDate, 'dd/MM/yyyy')})`
      } else if (isAfter(selectedDate, today)) {
        warnings.selling_date = '⚠️ Data no futuro não permitida'
      } else {
        delete warnings.selling_date
      }
    }
    
    if (name === 'selling_price' && value) {
      const price = Number(value)
      if (price < 5000) {
        warnings.selling_price = '⚠️ Valor abaixo do mínimo (R$ 5.000,00)'
      } else if (price > 5000000) {
        warnings.selling_price = '⚠️ Valor acima do máximo (R$ 5.000.000,00)'
      } else {
        delete warnings.selling_price
      }
    }
    
    if (name === 'year_manufacture' && value) {
      const year = Number(value)
      if (year < 1960) {
        warnings.year_manufacture = '⚠️ Ano anterior a 1960 não permitido'
      } else if (year > currentYear) {
        warnings.year_manufacture = `⚠️ Ano futuro não permitido (máximo: ${currentYear})`
      } else {
        delete warnings.year_manufacture
      }
    }
    
    
    
    setState({ ...state, car: carCopy, formModified: true, fieldWarnings: warnings })
  }

  function handleValidationErrors(issues) {
    const errors = {}
    const warnings = {}
    
    issues.forEach(issue => {
      const fieldName = issue.path[0]
      const message = issue.message
      
      // Converte mensagens do Zod em avisos mais específicos
      if (message.includes('anterior') || message.includes('posterior') || 
          message.includes('futuro') || message.includes('mínimo') || 
          message.includes('máximo')) {
        warnings[fieldName] = `⚠️ ${message}`
      } else {
        errors[fieldName] = message
      }
    })
    
    setState({ ...state, inputErrors: errors, fieldWarnings: warnings })
  }

  // Função para obter mensagem de ajuda com avisos
  const getHelperText = (fieldName, defaultText) => {
    if (inputErrors?.[fieldName]) {
      return `❌ ${inputErrors[fieldName]}`
    }
    if (fieldWarnings?.[fieldName]) {
      return fieldWarnings[fieldName]
    }
    return defaultText
  }

  // Função para verificar se há erro ou aviso no campo
  const hasIssue = (fieldName) => {
    return Boolean(inputErrors?.[fieldName] || fieldWarnings?.[fieldName])
  }

  // Função para obter a cor do helper text
  const getHelperTextColor = (fieldName) => {
    if (inputErrors?.[fieldName]) return 'error.main'
    if (fieldWarnings?.[fieldName]) return 'warning.main'
    return 'inherit'
  }

  async function handleFormSubmit(event) {
    event.preventDefault()
    showWaiting(true)
    try {
      setState({ ...state, inputErrors: {}, fieldWarnings: {} })

      const carData = { ...car }

      // Conversões para o formato esperado pelo back-end
      if (carData.year_manufacture) carData.year_manufacture = Number(carData.year_manufacture)
      
      // selling_price é opcional - converte apenas se preenchido
      if (carData.selling_price && carData.selling_price !== '') {
        carData.selling_price = Number(carData.selling_price)
      } else {
        carData.selling_price = null
      }

      // Garante que imported seja booleano
      carData.imported = Boolean(carData.imported)

      if (params.id) {
        await myfetch.put(`/cars/${params.id}`, carData)
      } else {
        await myfetch.post('/cars', carData)
      }

      notify('Item salvo com sucesso.', 'success', 4000, () => {
        navigate('..', { relative: 'path', replace: true })
      })
    } catch (error) {
      console.error(error)
      if (error.issues) {
        handleValidationErrors(error.issues)
        notify('Erro de validação. Verifique os campos destacados.', 'error')
      } else {
        notify(error.message, 'error')
      }
    } finally {
      showWaiting(false)
    }
  }

  React.useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    showWaiting(true)
    try {
      let carData = { ...formDefaults }
      const customersData = await myfetch.get('/customers')

      if (params.id) {
        carData = await myfetch.get(`/cars/${params.id}`)
        if (carData.selling_date) {
          carData.selling_date = parseISO(carData.selling_date)
        }
        // Garante que os valores numéricos sejam strings para os campos do formulário
        if (carData.year_manufacture) carData.year_manufacture = String(carData.year_manufacture)
        if (carData.selling_price) carData.selling_price = String(carData.selling_price)
      }

      setState({ 
        ...state, 
        car: carData, 
        customers: customersData 
      })
    } catch (error) {
      console.error(error)
      notify(error.message, 'error')
    } finally {
      showWaiting(false)
    }
  }

  async function handleBackButtonClick() {
    if (formModified && !(await askForConfirmation('Há informações não salvas. Deseja realmente sair?'))) {
      return
    }
    navigate('..', { relative: 'path', replace: true })
  }

  function handleKeyDown(event) {
    if (event.key === 'Delete') {
      const carCopy = { ...car, customer_id: '' }
      setState({ ...state, car: carCopy, formModified: true })
    }
  }

  const getFieldStyle = (fieldName, currentLength) => {
    if (inputErrors?.[fieldName]) {
      return { border: '1px solid red' }
    }
    if (fieldWarnings?.[fieldName]) {
      return { border: '1px solid orange' }
    }
    if (currentLength > 20) {
      return { border: '1px solid #ff9800' }
    }
    return {}
  }

  return (
    <>
      <ConfirmDialog />
      <Notification />
      <Waiting />

      <Typography variant='h1' gutterBottom>
        {params.id ? `Editar carro #${params.id}` : 'Cadastrar novo carro'}
      </Typography>

      <Box className='form-fields'>
        <form onSubmit={handleFormSubmit}>
          {/* Campo Brand - Obrigatório, 1-25 caracteres */}
          <TextField
            name='brand'
            label='Marca do carro'
            variant='filled'
            required
            fullWidth
            value={car.brand}
            onChange={handleFieldChange}
            helperText={getHelperText('brand', 
              `${car.brand.length}/25 caracteres ${car.brand.length > 20 ? ' - Limite próximo!' : ' - Obrigatório (1-25 caracteres)'}`
            )}
            error={hasIssue('brand')}
            inputProps={{
              maxLength: 25,
              style: getFieldStyle('brand', car.brand.length)
            }}
            FormHelperTextProps={{
              sx: {
                color: getHelperTextColor('brand'),
                fontWeight: hasIssue('brand') ? 'bold' : 'normal'
              }
            }}
          />
          
          {/* Campo Model - Obrigatório, 1-25 caracteres */}
          <TextField
            name='model'
            label='Modelo do carro'
            variant='filled'
            required
            fullWidth
            value={car.model}
            onChange={handleFieldChange}
            helperText={getHelperText('model',
              `${car.model.length}/25 caracteres ${car.model.length > 20 ? ' - Limite próximo!' : ' - Obrigatório (1-25 caracteres)'}`
            )}
            error={hasIssue('model')}
            inputProps={{
              maxLength: 25,
              style: getFieldStyle('model', car.model.length)
            }}
            FormHelperTextProps={{
              sx: {
                color: getHelperTextColor('model'),
                fontWeight: hasIssue('model') ? 'bold' : 'normal'
              }
            }}
          />

          {/* Campo Color - Obrigatório, seleção entre cores pré-definidas */}
          <TextField
            name='color'
            label='Cor do veículo'
            variant='filled'
            required
            fullWidth
            value={car.color}
            onChange={handleFieldChange}
            select
            helperText={getHelperText('color', 'Obrigatório - Selecione uma cor')}
            error={hasIssue('color')}
            FormHelperTextProps={{
              sx: {
                color: getHelperTextColor('color'),
                fontWeight: hasIssue('color') ? 'bold' : 'normal'
              }
            }}
          >
            {colors.map((color) => (
              <MenuItem key={color.value} value={color.value}>
                {color.label}
              </MenuItem>
            ))}
          </TextField>

          {/* Campo Year Manufacture - Obrigatório, 1960-ano atual */}
          <TextField
            name='year_manufacture'
            label='Ano de fabricação'
            variant='filled'
            required
            fullWidth
            select
            value={car.year_manufacture}
            onChange={handleFieldChange}
            helperText={getHelperText('year_manufacture', `Obrigatório - Entre 1960 e ${currentYear}`)}
            error={hasIssue('year_manufacture')}
            FormHelperTextProps={{
              sx: {
                color: getHelperTextColor('year_manufacture'),
                fontWeight: hasIssue('year_manufacture') ? 'bold' : 'normal'
              }
            }}
          >
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </TextField>

          {/* Campo Imported - Obrigatório, booleano */}
          <div className="MuiFormControl-root">
            <FormControlLabel
              control={
                <Checkbox
                  name='imported'
                  checked={car.imported || false}
                  onChange={handleFieldChange}
                  color='primary'
                />
              }
              label='Veículo importado'
            />
          </div>

          {/* Campo Plates - Obrigatório, exatamente 8 caracteres */}
          <InputMask
            mask='AAA-9$99'
            formatChars={plateMaskFormatChars}
            maskChar=' '
            value={car.plates}
            onChange={handleFieldChange}
          >
            {() => (
              <TextField
                name='plates'
                label='Placa do veículo'
                variant='filled'
                required
                fullWidth
                helperText={getHelperText('plates', 'Obrigatório - 8 caracteres, letras maiúsculas (ex: ABC-1234)')}
                error={hasIssue('plates')}
                FormHelperTextProps={{
                  sx: {
                    color: getHelperTextColor('plates'),
                    fontWeight: hasIssue('plates') ? 'bold' : 'normal'
                  }
                }}
              />
            )}
          </InputMask>

          {/* Campo Selling Date - Opcional */}
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            <DatePicker
              label='Data de venda'
              value={car.selling_date}
              onChange={(value) =>
                handleFieldChange({
                  target: { name: 'selling_date', value },
                })
              }
              slotProps={{
                textField: {
                  variant: 'filled',
                  fullWidth: true,
                  helperText: getHelperText('selling_date', 'Opcional - Não anterior a 20/03/2020'),
                  error: hasIssue('selling_date'),
                  FormHelperTextProps: {
                    sx: {
                      color: getHelperTextColor('selling_date'),
                      fontWeight: hasIssue('selling_date') ? 'bold' : 'normal'
                    }
                  }
                },
              }}
            />
          </LocalizationProvider>

          {/* Campo Selling Price - Opcional */}
          <TextField
            name='selling_price'
            label='Preço de venda (R$)'
            variant='filled'
            type='number'
            fullWidth
            value={car.selling_price}
            onChange={handleFieldChange}
            helperText={getHelperText('selling_price', 'Opcional - Entre R$ 5.000,00 e R$ 5.000.000,00')}
            error={hasIssue('selling_price')}
            inputProps={{
              min: 5000,
              max: 5000000,
              step: 0.01
            }}
            FormHelperTextProps={{
              sx: {
                color: getHelperTextColor('selling_price'),
                fontWeight: hasIssue('selling_price') ? 'bold' : 'normal'
              }
            }}
          />

          {/* Campo Customer - Obrigatório */}
          <TextField
            name='customer_id'
            label='Cliente'
            variant='filled'
            required
            fullWidth
            value={car.customer_id}
            onChange={handleFieldChange}
            onKeyDown={handleKeyDown}
            select
            helperText={getHelperText('customer_id', 'Obrigatório - Selecione um cliente')}
            error={hasIssue('customer_id')}
            FormHelperTextProps={{
              sx: {
                color: getHelperTextColor('customer_id'),
                fontWeight: hasIssue('customer_id') ? 'bold' : 'normal'
              }
            }}
          >
            {customers.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{ display: 'flex', justifyContent: 'space-around', width: '100%', mt: 2 }}>
            <Button variant='contained' color='secondary' type='submit' size='large'>
              Salvar
            </Button>
            <Button variant='outlined' onClick={handleBackButtonClick} size='large'>
              Voltar
            </Button>
          </Box>
        </form>
      </Box>
    </>
  )
}