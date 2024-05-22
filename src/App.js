import React, { useRef } from "react";
import "./App.css";
import { Login } from "./components/Login";
import { Viewer } from "./Viewer";

function App() {
  const apiRef = useRef(null);

  const changeBackgroundColor = () => {
    apiRef.current.setBackground({
      color: [Math.random(), Math.random(), Math.random(), 1],
    });
  };

  const changeChairColor = () => {
    apiRef.current.getMaterialList((err, materials) => {
      const plasticMaterial = materials.find(
        (material) => material.name === "Material.076" || material.name === 'Material0.44'   //Material.076
      );
      plasticMaterial.channels.AlbedoPBR.color = [
        Math.random(),
        Math.random(),
        Math.random(),
      ];
      apiRef.current.setMaterial(plasticMaterial, () => {
        console.log("Updated chair color");
      });
    });
  };

  return (
    <div className="App">
      
      <Viewer apiRef={apiRef}/>
      <br /> <br/>
      <button onClick={changeBackgroundColor}>Change background color</button>
      <br /> <br/>
      <button onClick={changeChairColor}>Change atom color</button>
      <br /> <br />
      <Login />
    </div>

  );
}

export default App;
