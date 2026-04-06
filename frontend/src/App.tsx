import { useEffect, useState } from "react";
import "./App.css";

const serverName = `http://localhost:3000`;

function App() {
  const [carsList, setCarsList] = useState([]);
  const [loading, setLoading] = useState(false);
  // const [error, setError] = useState(false);

  const fetchCarsList = async () => {
    setLoading(true);
    try {
      const url = `${serverName}/list`;
      const res = await fetch(url);
      const list = await res.json();
      console.log(list);
      setCarsList(list.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarsList();
  }, []);

  return (
    <div style={{ margin: "3rem" }}>
      <h1> Hottest Cars in 2026</h1>
      {/* <img src="http://localhost:3000/image" /> */}
      {loading ? (
        <h3> Loading...</h3>
      ) : carsList.length ? (
        <div
          style={{
            margin: "auto",
            width: "90vw",

            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, max-content)",
              width: "100%",
              justifyContent: "space-between",

              gap: "45px",
            }}
          >
            {carsList.map((item, i) => (
              <div key={i}>
                <img
                  src={`${serverName}/image?name=${item}`}
                  style={{
                    objectFit: "cover",
                    width: "600px",
                    height: "400px",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <h3>No Cars Found</h3>
      )}
    </div>
  );
}

export default App;
