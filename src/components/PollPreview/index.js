// ./src/components/PollPreview/index.js
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Link from 'gatsby-link';

import { Button } from '../../styledComponents/theme';

const Container = styled.section`
  margin-bottom: 10px;
`;

const PollPreview = ({ title, id }) => {
  return (
    <Container>
      <Link to={`poll/${id}`}>
        <Button>{title}</Button>
      </Link>
    </Container>
  );
};

PollPreview.propTypes = {
  title: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};

export default PollPreview;
