import React from 'react';
import logo from './github-logo.png';

const Navbar = () => (
    <div className="navbar">
        <h1 style={{margin: 0, display: "inline"}}>Alpha-CU-horse</h1>
        <a href="https://github.com/WasinWatt/checkers-web"><img src={logo}/></a>
    </div>
);

export default Navbar;
