import * as S from './styles';
import { Logo } from './components/Logo';
import { Login } from './components/Login';
import { INDENT } from '../../styles';

export const Header = () => {
  return (
    <S.Wrapper tag="header" cols={12} paddingTop={INDENT.m} paddingBottom={INDENT.m}>
      <Logo />
      <S.Actions>
        <S.CollectionButton />
        <Login />
      </S.Actions>
    </S.Wrapper>
  );
};