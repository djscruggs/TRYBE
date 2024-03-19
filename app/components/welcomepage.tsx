import React from 'react'
import { Link } from '@remix-run/react'

export const WelcomePage = (): JSX.Element => {
  return (
    <div className="welcome-page -mt-4">
      <div className="overlap">
        <div className="graphic-shape">
          <div className="overlap-group">
            <div className="ellipse" />
            <div className="div" />
            <img className="img" alt="Ellipse" src="https://c.animaapp.com/ZqyGLRPh/img/ellipse-11.svg" />
          </div>
          <div className="overlap-2">
            <div className="ellipse-2" />
            <div className="ellipse-3" />
          </div>
        </div>
        <Link to="signin">
          <div className="already-have-account cursor-pointer">
          <div className="div-wrapper">
            <p className="p">I already have an account</p>
          </div>
        </div>
        </Link>
        <Link to="/signup">
        <img
          className="sign-up-button cursor-pointer"
          alt="Sign up button"

          src="https://c.animaapp.com/ZqyGLRPh/img/sign-up-button@2x.png"
        />
        </Link>
        <div className="making-personal">
          Making personal
          <br />
          development a<br />
          community mission.
        </div>
        <div className="text-wrapper-2">TRYBE</div>
      </div>
    </div>
  )
}
