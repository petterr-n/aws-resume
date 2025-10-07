import React from "react";
import VisitorCounter from "./VisitorCounter";
import "./resume.css";

export default function Resume() {
  return (
    <div>
      <div id="header"></div>
      <div className="left"></div>
      <div className="stuff">
        <h1>Resume</h1>
        <h2>Petter Rønning-Nyvold</h2>
        <hr />
        <br />
        <p className="head">Interests</p>
        <ul>
        <li>Drawing</li>
        <li>Drawing more</li>
        <li>Drawing even more</li>
        <li>Drawing the most</li>
        </ul>

        <p className="head">Skills</p>
        <ul>
        <li>Web Design with HTML & CSS</li>
        </ul>

        <p className="head">Education</p>
        <ul>
        <li>Bachelor i Informatikk - Universitetet i Tromsø</li>
        <li>Master i Programvareutvikling - Universitetet i Bergen & Høgskulen på Vestlandet</li>
        </ul>

        <p className="head">Experience</p>
        <ul>
        <li>Nordlaks IT/OT - Utvikler</li>
        </ul>

        <p className="head">Extracurriculars</p>
        <ul>
        <li>Programstyre for Masterstudenter i Programvareutvikling</li>
        </ul>

        <VisitorCounter />
      </div>
      <div className="right"></div>
      <div id="footer"></div>
    </div>
  );
}
