import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Remove the token from localStorage
    localStorage.removeItem("token");

    // Optionally, call backend to clear any server-side session (if needed)
    axios.post("http://localhost:1111/api/v1/logout", {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Pass token if required by your backend
      }
    })
      .then((response) => {
        console.log(response.data); // handle response if needed
        navigate("/login"); // Redirect to login page after successful logout
      })
      .catch((err) => {
        console.log(err);
        navigate("/login"); // Redirect to login page in case of error
      });

  }, [navigate]); // useEffect hook ensures that logout logic runs once

  return (
    <div>
      <h2>Logging you out...</h2>
    </div>
  );
};

export default Logout;
