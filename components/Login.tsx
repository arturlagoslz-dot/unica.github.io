import React, { useState } from 'react';

interface LoginProps {
  onLogin: (login: string, password: string) => void;
}

type LoginType = 'professional' | 'parent';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loginType, setLoginType] = useState<LoginType>('parent');
  const [login, setLogin] = useState('111.222.333-44'); 
  const [password, setPassword] = useState('11122'); 

  const handleLoginTypeChange = (type: LoginType) => {
    setLoginType(type);
    // Clear fields on type change for better UX
    setLogin('');
    setPassword('');
    if (type === 'parent') {
        setLogin('111.222.333-44');
        setPassword('11122');
    } else {
        setLogin('diretor');
        setPassword('senha123');
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login || !password) {
        alert("Por favor, preencha o login e a senha.");
        return;
    }
    onLogin(login, password);
  };
  
  const LoginTypeButton: React.FC<{type: LoginType, label: string}> = ({type, label}) => (
    <button
        type="button"
        onClick={() => handleLoginTypeChange(type)}
        className={`w-full py-2.5 text-sm font-medium leading-5 text-center rounded-lg transition-colors
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            ${loginType === type
                ? 'bg-blue-600 text-white shadow'
                : 'text-blue-700 bg-white hover:bg-blue-50'
            }
        `}
    >
        {label}
    </button>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 space-y-8">
        <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Acesse o Sistema
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Sistema de Acompanhamento Pedagógico Infantil
            </p>
        </div>
        
        <div className="w-full px-2 py-2">
            <div className="flex space-x-2 rounded-xl bg-blue-100 p-1">
                <LoginTypeButton type="parent" label="Acesso do Responsável" />
                <LoginTypeButton type="professional" label="Acesso Profissional" />
            </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="login-input" className="sr-only">Login</label>
              <input
                id="login-input"
                name="login"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={loginType === 'parent' ? 'CPF do Aluno' : 'Login de usuário'}
                value={login}
                onChange={(e) => setLogin(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Senha</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {loginType === 'parent' && (
            <p className="text-xs text-center text-gray-500">
              A senha são os <strong>5 primeiros dígitos</strong> do CPF do aluno.
            </p>
          )}

          <div>
            <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Entrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;