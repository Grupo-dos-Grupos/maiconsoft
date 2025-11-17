import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Building2, 
  FileText, 
  MapPin,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { clienteAPI } from '../services/api';
import toast from 'react-hot-toast';

const ClienteForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [validatingCnpj, setValidatingCnpj] = useState(false);
  const [validatingCep, setValidatingCep] = useState(false);
  const [cnpjValid, setCnpjValid] = useState(null);
  const [cepData, setCepData] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      codigo: '',
      loja: '01',
      razao: '',
      tipo: 'J',
      nomefantasia: '',
      finalidade: 'F',
      cnpj: '',
      cep: '',
      pais: '105',
      estado: '',
      codmunicipio: '',
      cidade: '',
      endereco: '',
      numero: '',
      bairro: '',
      ddd: '',
      telefone: '',
      contato: '',
      email: '',
      homepage: ''
    }
  });

  const watchedCnpj = watch('cnpj');
  const watchedCep = watch('cep');

  useEffect(() => {
    if (isEdit) {
      loadCliente();
    }
  }, [id, isEdit]);

  useEffect(() => {
    if (watchedCnpj && watchedCnpj.replace(/\D/g, '').length === 14) {
      validateCnpj();
    }
  }, [watchedCnpj]);

  useEffect(() => {
    if (watchedCep && watchedCep.replace(/\D/g, '').length === 8) {
      buscarCep();
    }
  }, [watchedCep]);

  const loadCliente = async () => {
    try {
      setLoading(true);
      const response = await clienteAPI.getCliente(id);
      const cliente = response.data;
      reset({
        ...cliente,
        razao: cliente.nome || cliente.razao || '',
        telefone: cliente.telefone ? cliente.telefone.replace(/^(\d{2})(\d{4,5})(\d{4})$/, '$1$2$3') : '',
        codmunicipio: cliente.codmunicipio ? cliente.codmunicipio.toString() : ''
      });
    } catch (error) {
      toast.error('Erro ao carregar cliente');
      navigate('/clientes');
    } finally {
      setLoading(false);
    }
  };

  const validateCnpj = async () => {
    try {
      setValidatingCnpj(true);
      const response = await clienteAPI.validarCnpj(watchedCnpj.replace(/\D/g, ''));
      setCnpjValid(response.data.valido);
    } catch (error) {
      setCnpjValid(false);
    } finally {
      setValidatingCnpj(false);
    }
  };

  const buscarCep = async () => {
    try {
      setValidatingCep(true);
      const response = await clienteAPI.buscarCep(watchedCep.replace(/\D/g, ''));
      const data = response.data;
      
      if (data.erro) {
        toast.error('CEP não encontrado');
        return;
      }

      setCepData(data);
      setValue('estado', data.uf);
      setValue('cidade', data.localidade);
      setValue('endereco', data.logradouro);
      setValue('bairro', data.bairro);
      setValue('codmunicipio', data.ibge);
      
      toast.success('Endereço preenchido automaticamente!');
    } catch (error) {
      toast.error('Erro ao buscar CEP');
    } finally {
      setValidatingCep(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      const payload = {
          ...data,
          // Remover formatação antes de enviar
          cnpj: data.cnpj?.replace(/\D/g, '') || null,
          cep: data.cep?.replace(/\D/g, '') || null,
          telefone: data.telefone?.replace(/\D/g, '') || null,
      };

      if (isEdit) {
        await clienteAPI.updateCliente(id, payload);
        toast.success('Cliente atualizado com sucesso!');
      } else {
        await clienteAPI.createCliente(payload);
        toast.success('Cliente criado com sucesso!');
      }
      
      navigate('/clientes');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Erro ao processar a solicitação';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      id: 1,
      name: 'Dados Básicos',
      icon: Building2,
      description: 'Informações principais do cliente'
    },
    {
      id: 2,
      name: 'Documentos',
      icon: FileText,
      description: 'CNPJ e documentos fiscais'
    },
    {
      id: 3,
      name: 'Endereço e Contato',
      icon: MapPin,
      description: 'Localização e informações de contato'
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const formatCnpj = (value) => {
    const rawValue = value.replace(/\D/g, '');
    return rawValue.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const formatCep = (value) => {
    const rawValue = value.replace(/\D/g, '');
    return rawValue.replace(/^(\d{5})(\d{3})$/, '$1-$2');
  };

  const formatPhone = (value) => {
    const rawValue = value.replace(/\D/g, '');
    if (rawValue.length === 11) {
      return rawValue.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    }
    if (rawValue.length === 10) {
      return rawValue.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
    }
    return rawValue;
  };

  const handleChange = (e, fieldName, formatter) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const formattedValue = formatter(rawValue);
    setValue(fieldName, formattedValue);
  };
  
  if (loading && isEdit) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/clientes')}
          className="flex items-center text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Clientes
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? 'Editar Cliente' : 'Novo Cliente'}
        </h1>
        <p className="mt-2 text-gray-600">
          {isEdit ? 'Atualize as informações do cliente' : 'Preencha os dados do novo cliente'}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-center">
            {steps.map((step, stepIdx) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <li key={step.name} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                  <div className="flex items-center">
                    <div className={`relative flex h-8 w-8 items-center justify-center rounded-full ${
                      isCompleted ? 'bg-primary-600' : isActive ? 'bg-primary-600' : 'bg-gray-300'
                    }`}>
                      {isCompleted ? (
                        <Check className="h-5 w-5 text-white" />
                      ) : (
                        <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                      )}
                    </div>
                    <div className="ml-4 min-w-0">
                      <div className={`text-sm font-medium ${
                        isActive ? 'text-primary-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {step.name}
                      </div>
                      <div className="text-sm text-gray-500">{step.description}</div>
                    </div>
                  </div>
                  {stepIdx !== steps.length - 1 && (
                    <div className="absolute top-4 left-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300" />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      {/* Form */}
      <form onSubmit={(e) => e.preventDefault()} className="space-y-8 pt-6">
        <div className="card">
          <div className="card-content">
            {/* Step 1: Dados Básicos */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Dados Básicos</h3>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="label-required">Código</label>
                    <input
                      type="text"
                      {...register('codigo', { 
                        required: 'Código é obrigatório',
                        pattern: {
                          value: /^[A-Z0-9]{6}$/,
                          message: 'Código deve ter 6 caracteres alfanuméricos'
                        }
                      })}
                      className={`input ${errors.codigo ? 'input-error' : ''}`}
                      placeholder="Ex: C00001"
                      maxLength={6}
                    />
                    {errors.codigo && (
                      <p className="mt-1 text-sm text-danger-600">{errors.codigo.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="label-required">Loja</label>
                    <input
                      type="text"
                      {...register('loja', { 
                        required: 'Loja é obrigatória',
                        pattern: {
                          value: /^[0-9]{2}$/,
                          message: 'Loja deve ter 2 dígitos'
                        }
                      })}
                      className={`input ${errors.loja ? 'input-error' : ''}`}
                      placeholder="01"
                      maxLength={2}
                    />
                    {errors.loja && (
                      <p className="mt-1 text-sm text-danger-600">{errors.loja.message}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="label-required">Razão Social</label>
                    <input
                      type="text"
                      {...register('razao', { 
                        required: 'Razão social é obrigatória',
                        maxLength: { value: 60, message: 'Máximo 60 caracteres' }
                      })}
                      className={`input ${errors.razao ? 'input-error' : ''}`}
                      placeholder="Nome da empresa"
                    />
                    {errors.razao && (
                      <p className="mt-1 text-sm text-danger-600">{errors.razao.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="label-required">Tipo</label>
                    <select
                      {...register('tipo', { required: 'Tipo é obrigatório' })}
                      className={`input ${errors.tipo ? 'input-error' : ''}`}
                    >
                      <option value="J">Jurídica</option>
                      <option value="F">Física</option>
                    </select>
                    {errors.tipo && (
                      <p className="mt-1 text-sm text-danger-600">{errors.tipo.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Nome Fantasia</label>
                    <input
                      type="text"
                      {...register('nomefantasia', {
                        maxLength: { value: 60, message: 'Máximo 60 caracteres' }
                      })}
                      className={`input ${errors.nomefantasia ? 'input-error' : ''}`}
                      placeholder="Nome comercial"
                    />
                    {errors.nomefantasia && (
                      <p className="mt-1 text-sm text-danger-600">{errors.nomefantasia.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="label">Finalidade</label>
                    <select
                      {...register('finalidade')}
                      className="input"
                    >
                      <option value="F">Fiscal</option>
                      <option value="C">Comercial</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Documentos */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Documentos</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="label">CNPJ/CPF</label>
                    <div className="relative">
                      <input
                        type="text"
                        {...register('cnpj', {
                          pattern: {
                            value: /^\d{14}$/,
                            message: 'CNPJ deve ter 14 dígitos'
                          }
                        })}
                        className={`input ${errors.cnpj ? 'input-error' : ''}`}
                        placeholder="00.000.000/0000-00"
                        onChange={(e) => {
                            const rawValue = e.target.value.replace(/\D/g, '');
                            setValue('cnpj', rawValue, { shouldValidate: true });
                        }}
                        value={formatCnpj(watch('cnpj'))}
                      />
                      {validatingCnpj && (
                        <div className="absolute right-3 top-3">
                          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        </div>
                      )}
                      {cnpjValid === true && (
                        <div className="absolute right-3 top-3">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                      )}
                      {cnpjValid === false && (
                        <div className="absolute right-3 top-3">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        </div>
                      )}
                    </div>
                    {errors.cnpj && (
                      <p className="mt-1 text-sm text-danger-600">{errors.cnpj.message}</p>
                    )}
                    {cnpjValid === false && (
                      <p className="mt-1 text-sm text-danger-600">CNPJ inválido</p>
                    )}
                  </div>

                  <div>
                    <label className="label">País</label>
                    <input
                      type="text"
                      {...register('pais', {
                        pattern: {
                          value: /^[0-9]{3}$/,
                          message: 'Código do país deve ter 3 dígitos'
                        }
                      })}
                      className={`input ${errors.pais ? 'input-error' : ''}`}
                      placeholder="105"
                      maxLength={3}
                    />
                    {errors.pais && (
                      <p className="mt-1 text-sm text-danger-600">{errors.pais.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Endereço e Contato */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Endereço e Contato</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="label">CEP</label>
                    <div className="relative">
                      <input
                        type="text"
                        {...register('cep')}
                        className={`input ${errors.cep ? 'input-error' : ''}`}
                        placeholder="00000-000"
                        onChange={(e) => {
                            const rawValue = e.target.value.replace(/\D/g, '');
                            setValue('cep', rawValue, { shouldValidate: true });
                        }}
                        value={formatCep(watch('cep'))}
                      />
                      {validatingCep && (
                        <div className="absolute right-3 top-3">
                          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        </div>
                      )}
                    </div>
                    {errors.cep && (
                      <p className="mt-1 text-sm text-danger-600">{errors.cep.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="label">Estado</label>
                      <input
                        type="text"
                        {...register('estado', {
                          pattern: {
                            value: /^[A-Z]{2}$/,
                            message: 'Estado deve ter 2 letras'
                          }
                        })}
                        className={`input ${errors.estado ? 'input-error' : ''}`}
                        placeholder="SP"
                        maxLength={2}
                      />
                      {errors.estado && (
                        <p className="mt-1 text-sm text-danger-600">{errors.estado.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="label">Cidade</label>
                      <input
                        type="text"
                        {...register('cidade', {
                          maxLength: { value: 50, message: 'Máximo 50 caracteres' }
                        })}
                        className={`input ${errors.cidade ? 'input-error' : ''}`}
                        placeholder="Nome da cidade"
                      />
                      {errors.cidade && (
                        <p className="mt-1 text-sm text-danger-600">{errors.cidade.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="label">Código do Município</label>
                      <input
                        type="text"
                        {...register('codmunicipio')}
                        className={`input ${errors.codmunicipio ? 'input-error' : ''}`}
                        placeholder="0000000"
                        maxLength={7}
                      />
                      {errors.codmunicipio && (
                        <p className="mt-1 text-sm text-danger-600">{errors.codmunicipio.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="label">Bairro</label>
                      <input
                        type="text"
                        {...register('bairro', {
                          maxLength: { value: 30, message: 'Máximo 30 caracteres' }
                        })}
                        className={`input ${errors.bairro ? 'input-error' : ''}`}
                        placeholder="Nome do bairro"
                      />
                      {errors.bairro && (
                        <p className="mt-1 text-sm text-danger-600">{errors.bairro.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="label">Endereço</label>
                      <input
                        type="text"
                        {...register('endereco', {
                          maxLength: { value: 60, message: 'Máximo 60 caracteres' }
                        })}
                        className={`input ${errors.endereco ? 'input-error' : ''}`}
                        placeholder="Rua, avenida, logradouro"
                      />
                      {errors.endereco && (
                        <p className="mt-1 text-sm text-danger-600">{errors.endereco.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="label">Número</label>
                      <input
                        type="text"
                        {...register('numero', {
                          maxLength: { value: 20, message: 'Máximo 20 caracteres' }
                        })}
                        className={`input ${errors.numero ? 'input-error' : ''}`}
                        placeholder="123"
                      />
                      {errors.numero && (
                        <p className="mt-1 text-sm text-danger-600">{errors.numero.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="label">DDD</label>
                      <input
                        type="text"
                        {...register('ddd', {
                          pattern: {
                            value: /^[0-9]{2,3}$/,
                            message: 'DDD deve ter 2 ou 3 dígitos'
                          }
                        })}
                        className={`input ${errors.ddd ? 'input-error' : ''}`}
                        placeholder="15"
                        maxLength={3}
                      />
                      {errors.ddd && (
                        <p className="mt-1 text-sm text-danger-600">{errors.ddd.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="label">Telefone</label>
                      <input
                        type="text"
                        {...register('telefone', {
                          pattern: {
                            value: /^\d{8,9}$/,
                            message: 'Telefone deve ter 8 ou 9 dígitos'
                          }
                        })}
                        className={`input ${errors.telefone ? 'input-error' : ''}`}
                        placeholder="99999-9999"
                        onChange={(e) => {
                            const rawValue = e.target.value.replace(/\D/g, '');
                            setValue('telefone', rawValue, { shouldValidate: true });
                        }}
                        value={formatPhone(watch('telefone'))}
                      />
                      {errors.telefone && (
                        <p className="mt-1 text-sm text-danger-600">{errors.telefone.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="label">Email</label>
                      <input
                        type="email"
                        {...register('email', {
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'Email deve ter formato válido'
                          },
                          maxLength: { value: 100, message: 'Máximo 100 caracteres' }
                        })}
                        className={`input ${errors.email ? 'input-error' : ''}`}
                        placeholder="contato@empresa.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-danger-600">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="label">Contato</label>
                      <input
                        type="text"
                        {...register('contato', {
                          maxLength: { value: 50, message: 'Máximo 50 caracteres' }
                        })}
                        className={`input ${errors.contato ? 'input-error' : ''}`}
                        placeholder="Nome do contato"
                      />
                      {errors.contato && (
                        <p className="mt-1 text-sm text-danger-600">{errors.contato.message}</p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="label">Homepage</label>
                      <input
                        type="url"
                        {...register('homepage', {
                          maxLength: { value: 100, message: 'Máximo 100 caracteres' }
                        })}
                        className={`input ${errors.homepage ? 'input-error' : ''}`}
                        placeholder="https://www.empresa.com"
                      />
                      {errors.homepage && (
                        <p className="mt-1 text-sm text-danger-600">{errors.homepage.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="btn-secondary btn-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </button>

          <div className="flex space-x-4">
            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn-primary btn-md"
              >
                Próximo
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={loading || currentStep !== steps.length}
                className="btn-success btn-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                {isEdit ? 'Atualizar Cliente' : 'Criar Cliente'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ClienteForm;