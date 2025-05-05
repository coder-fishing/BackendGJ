import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { AiOutlinePlus } from 'react-icons/ai';

const PageHeader = ({ title, buttonText, buttonLink }) => {
  return (
    <div className="page-header">
      <h1>{title}</h1>
      {buttonLink && (
        <Link to={buttonLink} className="btn-add">
          <AiOutlinePlus /> {buttonText}
        </Link>
      )}
    </div>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  buttonText: PropTypes.string,
  buttonLink: PropTypes.string
};

export default PageHeader; 