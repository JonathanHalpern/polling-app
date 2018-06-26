// ./src/components/Header/index.js
import React from 'react';
import Link from 'gatsby-link';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import { Container as BaseContainerStyles } from '../../styledComponents/layout';
import { Heading2 } from '../../styledComponents/typography';
import SignIn from '../SignIn';
import GoogleIcon from '../Icons/Google';

const Container = BaseContainerStyles.extend`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderContainer = styled.header`
  ${props => props.background};
  margin-bottom: 1.45rem;
`;

const NameContainer = styled.div`
  display: flex;
`;

const Heading1 = styled.h1`
  margin: 0;
`;

const StyledLink = styled(Link)`
  color: white;
  text-decoration: none;
`;

const Avatar = styled.img`
  width: 25px;
  height: 25px;
  margin: 0 0 0 10px;
`;

const StyledGoogleIcon = styled(GoogleIcon)`
  margin-right: 5px;
`;

const BACKGROUND = 'background-color: #20232a';

const Header = ({
  background,
  title,
  isAuthed,
  signIn,
  signOut,
  displayName,
  photoURL,
}) => (
  <HeaderContainer background={background}>
    <Container>
      <Heading1>
        <StyledLink to="/">{title}</StyledLink>
      </Heading1>
      <NameContainer>
        <Heading2>Hello: {displayName}</Heading2>
        <Avatar src={photoURL} alt="" />
      </NameContainer>
      <SignIn
        onClick={() => (isAuthed ? signOut() : signIn('google'))}
        icon={isAuthed ? null : <StyledGoogleIcon />}
        text={isAuthed ? 'Sign Out' : 'Sign in with Google'}
      />
    </Container>
  </HeaderContainer>
);

Header.defaultProps = {
  background: BACKGROUND,
};

Header.propTypes = {
  background: PropTypes.string,
  signIn: PropTypes.func.isRequired,
  signOut: PropTypes.func.isRequired,
  title: PropTypes.string,
  isAuthed: PropTypes.bool,
  displayName: PropTypes.string,
  photoURL: PropTypes.string,
};

export default Header;
