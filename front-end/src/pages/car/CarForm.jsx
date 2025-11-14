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
import Car from '../../models/Car.js'
import { ZodError } from 'zod'

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


// ✅ Função para detectar o tipo de placa (8 caracteres com hífen)
const detectPlateType = (plate) => {
  if (plate.length === 0) {
    return { status: 'empty' }
  }
  
  // Placa Antiga Brasileira: ABC-1234 (8 caracteres com hífen)
  if (/^[A-Z]{3}-[0-9]{4}$/.test(plate)) {
    return { status: 'valid_old', type: 'old' }
  }
  if (/^[A-Z]{3}-[0-9]{0,4}$/.test(plate) && plate.length <= 8) {
    return { status: 'partial_old', type: 'old' }
  }
  
  // Placa Mercosul: ABC-1D23 (8 caracteres com hífen)
  if (/^[A-Z]{3}-[0-9][A-Z0-9][0-9]{2}$/.test(plate)) {
    return { status: 'valid_mercosul', type: 'mercosul' }
  }
  if (/^[A-Z]{3}-[0-9][A-Z0-9]?[0-9]{0,2}$/.test(plate) && plate.length <= 8) {
    return { status: 'partial_mercosul', type: 'mercosul' }
  }
  
  return { status: 'invalid_format' }
}

// ✅ Função para validar se a placa é válida
const isValidPlate = (plate) => {
  const { status } = detectPlateType(plate)
  return status.startsWith('valid_')
}

// ✅ Função para obter a cor do status da placa
const getPlateStatusColor = (plate) => {
  const { status } = detectPlateType(plate)
  
  switch (status) {
    case 'valid_old':
    case 'valid_mercosul':
      return '#4caf50' // ✅ VERDE
    case 'partial_old':
    case 'partial_mercosul':
      return '#ff9800' // ⚠️ LARANJA
    case 'invalid_format':
      return '#f44336' // ❌ VERMELHO
    default:
      return '#666'    // ⬜ CINZA
  }
}

// ✅ Função para obter o estilo do campo da placa
const getPlateFieldStyle = (plate) => {
  const { status } = detectPlateType(plate)
  const isEmpty = plate.length === 0
  
  if (isEmpty) {
    return {
      border: '2px solid #ccc',
      backgroundColor: 'transparent'
    }
  }
  
  switch (status) {
    case 'valid_old':
    case 'valid_mercosul':
      return {
        border: '2px solid #4caf50',
        
      }
    case 'partial_old':
    case 'partial_mercosul':
      return {
        border: '2px solid #ff9800',
        
      }
    case 'invalid_format':
      return {
        border: '2px solid #f44336',
        
      }
    default:
      return {
        border: '2px solid #ccc',
        backgroundColor: 'transparent'
      }
  }
}

// ✅ Função para formatar a placa na exibição
const formatPlateDisplay = (plate) => {
  const cleanPlate = plate.replace(/[^A-Z0-9]/g, '')
  const { type } = detectPlateType(plate)
  
  if (cleanPlate.length <= 3) {
    return cleanPlate
  }
  
  switch (type) {
    case 'old':
      // ABC-1234
      return cleanPlate.slice(0, 3) + (cleanPlate.length > 3 ? '-' + cleanPlate.slice(3) : '')
    case 'mercosul':
      // ABC-1D23
      return cleanPlate.slice(0, 3) + (cleanPlate.length > 3 ? '-' + cleanPlate.slice(3) : '')
    default:
      return cleanPlate
  }
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
        warnings.selling_date = `❌ Data anterior à abertura da loja (${format(storeOpeningDate, 'dd/MM/yyyy')})`
      } else if (isAfter(selectedDate, today)) {
        warnings.selling_date = '❌ Data no futuro não permitida'
      } else {
        delete warnings.selling_date
      }
    }

    if (name === 'selling_price' && value) {
      const price = Number(value)
      if (price < 5000) {
        warnings.selling_price = '❌ Valor abaixo do mínimo (R$ 5.000,00)'
      } else if (price > 5000000) {
        warnings.selling_price = '❌ Valor acima do máximo (R$ 5.000.000,00)'
      } else {
        delete warnings.selling_price
      }
    }

    if (name === 'year_manufacture' && value) {
      const year = Number(value)
      if (year < 1960) {
        warnings.year_manufacture = '❌ Ano anterior a 1960 não permitido'
      } else if (year > currentYear) {
        warnings.year_manufacture = `❌ Ano futuro não permitido (máximo: ${currentYear})`
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
        warnings[fieldName] = `❌ ${message}`
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

  // ✅ NOVA FUNÇÃO: Sistema de 3 cores para todos os campos
  const getFieldStatus = (fieldName, value, maxLength = null) => {
    // Se tem erro Zod, sempre retorna ERRO
    if (inputErrors?.[fieldName] || fieldWarnings?.[fieldName]) {
      return 'error'
    }

    // Para campos de texto com limite de caracteres
    if (maxLength && typeof value === 'string') {
      const length = value.length
      if (length === 0) return 'empty'
      if (length <= maxLength * 0.8) return 'good' // ✅ Até 50% - BOM
      if (length <= maxLength * 0.99) return 'warning' // ⚠️ 50%-80% - ALERTA
      return 'error' // ❌ Acima de 80% - ERRO
    }

    // Para campos numéricos
    if (typeof value === 'number' || (value && !isNaN(value))) {
      const numValue = Number(value)
      if (fieldName === 'selling_price') {
        if (numValue >= 5000 && numValue <= 5000000) return 'good'
        if (numValue > 0) return 'error'
      }
      if (fieldName === 'year_manufacture') {
        if (numValue >= 1960 && numValue <= currentYear) return 'good'
        if (numValue > 0) return 'error'
      }
    }

    // Para campos obrigatórios preenchidos
    if (value && value !== '') return 'good'

    return 'empty'
  }

  // ✅ NOVA FUNÇÃO: Cor baseada no status
  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return '#4caf50' // ✅ VERDE
      case 'warning': return '#ff9800' // ⚠️ LARANJA
      case 'error': return '#f44336' // ❌ VERMELHO
      default: return '' // ⬜ CINZA (vazio)
    }
  }

  // ✅ NOVA FUNÇÃO: Mensagem baseada no status
  const getStatusMessage = (fieldName, value, maxLength = null, defaultMessage) => {
    const status = getFieldStatus(fieldName, value, maxLength)

    if (inputErrors?.[fieldName]) return `❌ ${inputErrors[fieldName]}`
    if (fieldWarnings?.[fieldName]) return fieldWarnings[fieldName]

    switch (status) {
      case 'good':
        if (maxLength) return `✅ ${value.length}/${maxLength} caracteres - OK`
        return '✅ Preenchido corretamente'
      case 'warning':
        if (maxLength) return `⚠️ ${value.length}/${maxLength} caracteres - Limite próximo!`
        return '⚠️ Verifique este campo'
      case 'error':
        if (maxLength) return `❌ ${value.length}/${maxLength} caracteres - Limite excedido!`
        return '❌ Campo com problema'
      default:
        return defaultMessage
    }
  }

  // ✅ FUNÇÃO ATUALIZADA: Estilo do campo baseado no status
  const getFieldStyle = (fieldName, value, maxLength = null) => {
    const status = getFieldStatus(fieldName, value, maxLength)
    const color = getStatusColor(status)

    if (status === 'empty') return {}
    return {
      border: `2px solid ${color}`,

    }
  }

  async function handleFormSubmit(event) {
    event.preventDefault()
    showWaiting(true)
    try {
      setState({ ...state, inputErrors: {}, fieldWarnings: {} })

      const carData = { ...car }

      // Conversões para o formato esperado pelo back-end
      if (carData.year_manufacture) carData.year_manufacture = Number(carData.year_manufacture)

      if (carData.selling_price && carData.selling_price !== '') {
        carData.selling_price = Number(carData.selling_price)
      } else {
        carData.selling_price = null
      }

      carData.imported = Boolean(carData.imported)

      // ✅ VALIDAÇÃO ZOD NO FRONTEND
      Car.parse(carData)

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
      if (error instanceof ZodError) {
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
            helperText={getStatusMessage('brand', car.brand, 25, 'Obrigatório (1-25 caracteres)')}
            error={getFieldStatus('brand', car.brand, 25) === 'error'}
            inputProps={{
              maxLength: 25,
              style: getFieldStyle('brand', car.brand, 25)
            }}
            FormHelperTextProps={{
              sx: {
                color: getStatusColor(getFieldStatus('brand', car.brand, 25)),
                fontWeight: getFieldStatus('brand', car.brand, 25) !== 'empty' ? 'bold' : 'normal'
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
            helperText={getStatusMessage('model', car.model, 25, 'Obrigatório (1-25 caracteres)')}
            error={getFieldStatus('model', car.model, 25) === 'error'}
            inputProps={{
              maxLength: 25,
              style: getFieldStyle('model', car.model, 25)
            }}
            FormHelperTextProps={{
              sx: {
                color: getStatusColor(getFieldStatus('model', car.model, 25)),
                fontWeight: getFieldStatus('model', car.model, 25) !== 'empty' ? 'bold' : 'normal'
              }
            }}
          />

          {/* Campo Color - Obrigatório */}
          <TextField
            name='color'
            label='Cor do veículo'
            variant='filled'
            required
            fullWidth
            value={car.color}
            onChange={handleFieldChange}
            select
            helperText={getStatusMessage('color', car.color, null, 'Obrigatório - Selecione uma cor')}
            error={getFieldStatus('color', car.color) === 'error'}
            FormHelperTextProps={{
              sx: {
                color: getStatusColor(getFieldStatus('color', car.color)),
                fontWeight: getFieldStatus('color', car.color) !== 'empty' ? 'bold' : 'normal'
              }
            }}
            SelectProps={{
              sx: getFieldStyle('color', car.color)
            }}
          >
            {colors.map((color) => (
              <MenuItem key={color.value} value={color.value}>
                {color.label}
              </MenuItem>
            ))}
          </TextField>

          {/* Campo Year Manufacture - Obrigatório */}
          <TextField
            name='year_manufacture'
            label='Ano de fabricação'
            variant='filled'
            required
            fullWidth
            select
            value={car.year_manufacture}
            onChange={handleFieldChange}
            helperText={getStatusMessage('year_manufacture', car.year_manufacture, null, `Obrigatório - Entre 1960 e ${currentYear}`)}
            error={getFieldStatus('year_manufacture', car.year_manufacture) === 'error'}
            FormHelperTextProps={{
              sx: {
                color: getStatusColor(getFieldStatus('year_manufacture', car.year_manufacture)),
                fontWeight: getFieldStatus('year_manufacture', car.year_manufacture) !== 'empty' ? 'bold' : 'normal'
              }
            }}
            SelectProps={{
              sx: getFieldStyle('year_manufacture', car.year_manufacture)
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
                  sx={{
                    color: getStatusColor(getFieldStatus('imported', car.imported)),
                    '&.Mui-checked': {
                      color: getStatusColor(getFieldStatus('imported', car.imported)),
                    }
                  }}
                />
              }
              label='Veículo importado'
            />
          </div>

      
        {/* Campo Plates - Obrigatório, 8 caracteres com hífen */}
<InputMask
  mask="aaa-****"
  maskChar=""
  value={car.plates}
  onChange={handleFieldChange}
  beforeMaskedValueChange={(newState, oldState, userInput) => {
    let { value } = newState
    
    // Converte para maiúsculas e formata
    value = value.toUpperCase()
    
    return {
      ...newState,
      value
    }
  }}
>
  {() => {
    const plateType = detectPlateType(car.plates)
    const isEmpty = car.plates.length === 0
    const isComplete = car.plates.length === 8

    return (
      <TextField
        name="plates"
        label="Placa do veículo"
        variant="filled"
        required
        fullWidth
        helperText={
          isEmpty
            ? "Obrigatório - 8 caracteres com hífen"
            : !isComplete
            ? `⚠️ ${car.plates.length}/8 caracteres - Complete a placa`
            : plateType.status === 'valid_old'
            ? "✅ Placa antiga válida"
            : plateType.status === 'valid_mercosul'
            ? "✅ Placa Mercosul válida"
            : "❌ Formato inválido - Use: ABC-1234 ou ABC-1D23"
        }
        error={!isEmpty && (!isComplete || plateType.status === 'invalid_format')}
        inputProps={{
          style: {
            textTransform: 'uppercase',
            fontFamily: 'monospace',
            letterSpacing: '1px',
            ...getPlateFieldStyle(car.plates)
          }
        }}
        FormHelperTextProps={{
          sx: {
            color: getPlateStatusColor(car.plates),
            fontWeight: !isEmpty ? 'bold' : 'normal',
            fontSize: '0.75rem'
          }
        }}
      />
    )
  }}
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
                  helperText: getStatusMessage('selling_date', car.selling_date, null, 'Opcional - Não anterior a 20/03/2020'),
                  error: getFieldStatus('selling_date', car.selling_date) === 'error',
                  sx: getFieldStyle('selling_date', car.selling_date),
                  FormHelperTextProps: {
                    sx: {
                      color: getStatusColor(getFieldStatus('selling_date', car.selling_date)),
                      fontWeight: getFieldStatus('selling_date', car.selling_date) !== 'empty' ? 'bold' : 'normal'
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
            helperText={getStatusMessage('selling_price', car.selling_price, null, 'Opcional - Entre R$ 5.000,00 e R$ 5.000.000,00')}
            error={getFieldStatus('selling_price', car.selling_price) === 'error'}
            inputProps={{
              min: 5000,
              max: 5000000,
              step: 0.01,
              style: getFieldStyle('selling_price', car.selling_price)
            }}
            FormHelperTextProps={{
              sx: {
                color: getStatusColor(getFieldStatus('selling_price', car.selling_price)),
                fontWeight: getFieldStatus('selling_price', car.selling_price) !== 'empty' ? 'bold' : 'normal'
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
            helperText={getStatusMessage('customer_id', car.customer_id, null, 'Obrigatório - Selecione um cliente')}
            error={getFieldStatus('customer_id', car.customer_id) === 'error'}
            FormHelperTextProps={{
              sx: {
                color: getStatusColor(getFieldStatus('customer_id', car.customer_id)),
                fontWeight: getFieldStatus('customer_id', car.customer_id) !== 'empty' ? 'bold' : 'normal'
              }
            }}
            SelectProps={{
              sx: getFieldStyle('customer_id', car.customer_id)
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