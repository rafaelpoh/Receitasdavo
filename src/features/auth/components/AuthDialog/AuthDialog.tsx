import { FC, useState, FormEvent, useCallback } from 'react';
import { Modal } from '../../../../components/Modal/Modal';
import { TextInput } from '../../../../components/Input/Input';
import { Button } from '../../../../components/Button/Button';
import { useToast } from '../../../../components/Toast/ToastContext';
import type { AuthMode, AuthCredentials } from '../../../../types/auth';
import styles from './AuthDialog.module.css';

export interface AuthDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onLogin: (credentials: AuthCredentials) => Promise<unknown>;
  readonly onRegister: (credentials: AuthCredentials) => Promise<unknown>;
}

export const AuthDialog: FC<AuthDialogProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
}) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === 'login' ? 'register' : 'login'));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Por favor, preencha email e senha.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await onLogin({ email, password });
        showToast('Bem-vindo de volta!', 'success');
      } else {
        await onRegister({ email, password });
        showToast('Conta criada com sucesso!', 'success');
      }
      setEmail('');
      setPassword('');
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao autenticar.';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'login' ? 'Entrar' : 'Criar Conta'}
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <TextInput
          id="auth-email"
          label="E-mail"
          type="email"
          required
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextInput
          id="auth-password"
          label="Senha"
          type="password"
          required
          placeholder="Sua senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className={styles.actions}>
          <Button
            type="button"
            variant="text"
            onClick={toggleMode}
          >
            {mode === 'login' ? 'Criar uma conta' : 'Já tenho uma conta'}
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
          >
            {mode === 'login' ? 'Entrar' : 'Cadastrar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
