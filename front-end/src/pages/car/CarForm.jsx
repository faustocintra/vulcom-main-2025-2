import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3'
import { parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import React from 'react'
import InputMask from 'react-input-mask'
import { useNavigate, useParams } from 'react-router-dom'
import myfetch from '../../lib/myfetch'
import useConfirmDialog from '../../ui/useConfirmDialog'
import useNotification from '../../ui/useNotification'
import useWaiting from '../../ui/useWaiting'
import Car from '../../models/Car' // NOVO IMPORT

export default function CarForm() {
  /*
    Por padrão, todos os campos do nosso formulário terão como
    valor inicial uma string vazia. A exceção é o campo birth_date
    que, devido ao funcionamento do componente DatePicker, deve
    iniciar valendo null.
  */
  const formDefaults = {
    brand: '',
    model: '',
    color: '',
    year_manufacture: '',
    imported: false,
    plates: '',
    selling_date: null,
    selling_price: '', // Valor inicial como string vazia para o campo de número
    customer_id: ''
  }

  const [state, setState] = React.useState({
    car: { ...formDefaults },
    formModified: false,
    customers: [],
    inputErrors: {},
  })
  const { car, customers, formModified, inputErrors } = state

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
    9: '[0-9]', // somente dígitos
    $: '[0-9A-J]', // dígito de 0 a 9 ou uma letra de A a J.
    A: '[A-Z]', //  letra maiúscula de A a Z.
  }

  const currentYear = new Date().getFullYear()
  const minYear = 1960
  const years = []
  for (let year = currentYear; year >= minYear; year--) {
    years.push(year)
  }

  const [imported, setImported] = React.useState(false)
  // car.imported = imported
  const handleImportedChange = (event) => {
    setImported(event.target.checked)
  }

  function handleFieldChange(event) {
    const carCopy = { ...car }
    carCopy[event.target.name] = event.target.value
    setState({ ...state, car: carCopy, formModified: true })
  }

  // NOVA FUNÇÃO DE VALIDAÇÃO COM ZOD
  async function validateForm() {
    
    // Criar uma cópia do objeto car para manipulação e validação
    const carToValidate = { ...car }

    // Campos que são opcionais e precisam ser convertidos de '' para null para validação Zod
    if (carToValidate.selling_price === '') carToValidate.selling_price = null
    if (carToValidate.customer_id === '') carToValidate.customer_id = null
    // selling_date já é inicializado com null, então não precisa de verificação de string.
    
    // Tentar validar os dados com o modelo Zod
    const validation = await Car.safeParseAsync(carToValidate)
    
    // Se a validação falhar, montar o objeto de erros para exibir no formulário
    if (!validation.success) {
      const errors = {}
      for (const err of validation.error.issues) {
        errors[err.path[0]] = err.message
      }
      setState({ ...state, inputErrors: errors })
      return false
    }

    // Se a validação for bem-sucedida, limpar erros e retornar o objeto validado
    setState({ ...state, inputErrors: {} })
    // Retornar o objeto validado (com a coerção de tipos do Zod, se necessário)
    return validation.data
  }

  async function handleFormSubmit(event) {
    event.preventDefault(); // Evita que a página seja recarregada
    showWaiting(true); // Exibe a tela de espera
    try {

      // VALIDAÇÃO FRONT-END: Valida e obtém o objeto com os tipos corretos (ex: price como number/null)
      const validatedCar = await validateForm()
      if (!validatedCar) {
        notify('Há campos inválidos no formulário.', 'error')
        return // Sai da função se a validação falhar
      }

      // NÃO é mais necessário, pois validateForm já converte string vazia para null para o Zod.
      /*if(car.selling_price === '') car.selling_price = null*/

      // Se houver parâmetro na rota, significa que estamos modificando
      // um cliente já existente. A requisição será enviada ao back-end
      // usando o método PUT
      if (params.id) await myfetch.put(`/cars/${params.id}`, validatedCar)
      // Caso contrário, estamos criando um novo cliente, e enviaremos
      // a requisição com o método POST
      else await myfetch.post('/cars', validatedCar)

      // Deu certo, vamos exbir a mensagem de feedback que, quando for
      // fechada, vai nos mandar de volta para a listagem de clientes
      notify('Item salvo com sucesso.', 'success', 4000, () => {
        navigate('..', { relative: 'path', replace: true })
      })
    } catch (error) {
      console.error(error)
      
      // Tratamento de erros de validação do back-end (HTTP 422)
      if (error.status === 422) {
        const errors = {}
        for (const err of error.body.errors) {
          errors[err.field] = err.message
        }
        setState({ ...state, inputErrors: errors })
        notify('Erro de validação: verifique os campos em vermelho.', 'error')
      }
      else {
        notify(error.message, 'error')
      }
    } finally {
      // Desliga a tela de espera, seja em caso de sucesso, seja em caso de erro
      showWaiting(false)
    }
  }

  /*
    useEffect() que é executado apenas uma vez, no carregamento do componente.
    Verifica se a rota tem parâmetro. Caso tenha, significa que estamos vindo
    do componente de listagem por meio do botão de editar, e precisamos chamar
    a função loadData() para buscar no back-end os dados do cliente a ser editado
  */
  React.useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    showWaiting(true)
    try {

      let car = { ...formDefaults }, customers = []

      // Busca a lista de clientes para preencher o combo de escolha
      // do cliente que comprou o carro
      customers = await myfetch.get('/customers')

      // Se houver parâmetro na rota, precisamos buscar o carro para
      // ser editado
      if(params.id) {

        car = await myfetch.get(`/cars/${params.id}`)

        // Converte o formato de data armazenado no banco de dados
        // para o formato reconhecido pelo componente DatePicker
        
        if(car.selling_date) {
          car.selling_date = parseISO(car.selling_date)
        }

        // Converte o preço de venda de null para '' para o campo de texto
        if(car.selling_price === null) {
          car.selling_price = ''
        }
      }

      setState({ ...state, car, customers })

    } catch (error) {
      console.error(error)
      notify(error.message, 'error')
    } finally {
      showWaiting(false)
    }
  }

  async function handleBackButtonClick() {
    if (
      formModified &&
      !(await askForConfirmation(
        'Há informações não salvas. Deseja realmente sair?'
      ))
    )
      return; // Sai da função sem fazer nada

    // Navega de volta para a página de listagem
    navigate('..', { relative: 'path', replace: true })
  }

  function handleKeyDown(event) {
    if(event.key === 'Delete') {
      const stateCopy = {...state}
      // Garante que o ID do cliente seja definido como null para campos opcionais
      stateCopy.car.customer_id = null 
      setState(stateCopy)
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
          <TextField
            name='brand'
            label='Marca do carro'
            variant='filled'
            required
            fullWidth
            value={car.brand}
            onChange={handleFieldChange}
            helperText={inputErrors?.brand}
            error={inputErrors?.brand}
          />
          <TextField
            name='model'
            label='Modelo do carro'
            variant='filled'
            required
            fullWidth
            value={car.model}
            onChange={handleFieldChange}
            helperText={inputErrors?.model}
            error={inputErrors?.model}
          />

          <TextField
            name='color'
            label='Color'
            variant='filled'
            required
            fullWidth
            value={car.color}
            onChange={handleFieldChange}
            select
            helperText={inputErrors?.color} // CORRIGIDO: era inputErrors?.state
            error={inputErrors?.color}     // CORRIGIDO: era inputErrors?.state
          >
            {colors.map((s) => (
              <MenuItem key={s.value} value={s.value}>
                {s.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            name='year_manufacture'
            label='Ano de fabricação'
            variant='filled'
            required
            fullWidth
            select
            value={car.year_manufacture}
            onChange={handleFieldChange}
            helperText={inputErrors?.year_manufacture}
            error={inputErrors?.year_manufacture}
          >
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </TextField>

          <div class="MuiFormControl-root">
            <FormControlLabel
              control={
                <Checkbox
                  name='imported'
                  variant='filled'
                  // A linha abaixo foi removida pois é uma atribuição durante o render
                  // value={(car.imported = imported)} 
                  value={car.imported} // Agora usa o valor do objeto car diretamente
                  checked={imported}
                  onChange={handleImportedChange}
                  color='primary'
                />
              }
              label='Importado'
            />
          </div>

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
                label='Placa'
                variant='filled'
                required
                fullWidth
                helperText={inputErrors?.plates} // CORRIGIDO: era inputErrors?.phone
                error={inputErrors?.plates}     // CORRIGIDO: era inputErrors?.phone
              />
            )}
          </InputMask>

          <LocalizationProvider
            dateAdapter={AdapterDateFns}
            adapterLocale={ptBR}
          >
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
                  required: false, // Explicitamente não requerido (opcional)
                  helperText: inputErrors?.selling_date,
                  error: inputErrors?.selling_date,
                },
              }}
            />
          </LocalizationProvider>

          <TextField
            name='selling_price'
            label='Preço de venda'
            variant='filled'
            type='number'
            fullWidth
            value={car.selling_price}
            onChange={handleFieldChange}
            helperText={inputErrors?.selling_price}
            error={inputErrors?.selling_price}
          />

          <TextField
            name='customer_id'
            label='Cliente'
            variant='filled'
            // REMOVIDO: required. O campo é opcional (carro não vendido) e deve ser nullish.
            // required
            fullWidth
            value={car.customer_id}
            onChange={handleFieldChange}
            onKeyDown={handleKeyDown}
            select
            helperText={inputErrors?.customer_id || 'Tecle DEL para limpar o cliente'}
            error={inputErrors?.customer_id}
          >
            {customers.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-around',
              width: '100%',
            }}
          >
            <Button variant='contained' color='secondary' type='submit'>
              Salvar
            </Button>
            <Button variant='outlined' onClick={handleBackButtonClick}>
              Voltar
            </Button>
          </Box>

          {/*<Box sx={{ fontFamily: 'monospace', display: 'flex', width: '100%' }}>
            {JSON.stringify(car)}
          </Box>*/}
        </form>
      </Box>
    </>
  )
}