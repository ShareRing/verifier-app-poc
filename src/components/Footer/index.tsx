import classnames from 'classnames';
import React from 'react';
import { Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import * as Icon from 'react-bootstrap-icons';
import { useDarkMode } from '../../hooks/useDarkMode';
import './Footer.scss';
import { ReactComponent as Logoi } from '../../assets/images/logoi.svg';

function ToggleDarkModeButton() {
  const [theme, toggle] = useDarkMode();
  const onClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    toggle();
  };
  return (
    <>
      <OverlayTrigger
        placement="top"
        overlay={(props) => (
          <Tooltip {...props}>{`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}</Tooltip>
        )}
      >
        <a href="#" onClick={onClick}>
          {theme === 'light' ? (
            <Icon.MoonStarsFill className="text-secondary" />
          ) : (
            <Icon.SunFill className="text-warning" />
          )}
        </a>
      </OverlayTrigger>
    </>
  );
}

function Footer({ className }: React.HTMLAttributes<HTMLElement>) {
  const socialLinks = [
    { name: 'linkedin', url: '#', icon: <Icon.Linkedin /> },
    { name: 'twitter', url: '#', icon: <Icon.Twitter /> },
    { name: 'facebook', url: '#', icon: <Icon.Facebook /> },
    { name: 'telegram', url: '#', icon: <Icon.Telegram /> },
    { name: 'github', url: '#', icon: <Icon.Github /> }
  ];

  return (
    <footer
      className={classnames(
        'd-flex flex-wrap justify-content-between align-items-center py-3 border-top',
        className
      )}
    >
      <Col
        md="4"
        className="d-flex align-items-center text-muted align-center justify-content-start"
      >
        <Logoi height="1em" width="1em" />
        <span className="text-primary">&nbsp;ShareRing&nbsp;</span>2022
      </Col>
      <Col as="ul" md="4" className="social-links nav justify-content-end list-unstyled d-flex">
        {socialLinks.map((e) => (
          <li key={e.name} className="ms-3">
            <a className="text-muted" href={e.url} target="_blank" rel="noreferrer">
              {e.icon}
            </a>
          </li>
        ))}
        <li className="ms-4">
          <ToggleDarkModeButton />
        </li>
      </Col>
    </footer>
  );
}

export default Footer;
