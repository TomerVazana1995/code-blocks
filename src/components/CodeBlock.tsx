import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import { Editor } from "@monaco-editor/react";
import { FaRegSmileBeam } from "react-icons/fa";

const CodeBlock = () => {
  const { id } = useParams<string>();
  const navigate = useNavigate();
  const [code, setCode] = useState<string | undefined>(undefined);
  const [solution, setSolution] = useState<string | undefined>("");
  const [role, setRole] = useState<"mentor" | "student">("mentor");
  const [studentsCount, setStudentsCount] = useState<number>(0);
  const socketRef = useRef<Socket | null>(null);

  //get the initial code block data from the database
  useEffect(() => {
    async function getData() {
      try {
        const result = await axios.get(`https://code-block-api-production.up.railway.app/${id}`);
        const formattedCode = result.data[0].code
          .slice(1, -1) // Remove surrounding quotes
          .replace(/\\t/g, "\t"); // Replace the literal `\t` with actual tabs;
        const formattedSolution = result.data[0].solution
          .slice(1, -1)
          .replace(/\\t/g, "\t");
        setCode(formattedCode);
        setSolution(formattedSolution);
      } catch (error) {
        console.error(error);
      }
    }

    getData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // set the socket listeners
  useEffect(() => {
    socketRef.current = io("http://localhost:5000");
    const socket = socketRef.current;

    if (socket) {
      socket.emit("joinRoom", { codeBlockId: id });

      socket.on("role", (role: "mentor" | "student") => setRole(role));

      socket.on("updateCode", (newCode: string) => setCode(newCode));

      socket.on("numberOfStudents", (studentsInRoom: number) => {
        setStudentsCount(studentsInRoom);
      });

      return () => {
        if (socket) {
          socket.off("role");
          socket.off("numberOfStudents");
          socket.off("updateCode");
          socket.close();
        }
      };
    }
  }, [id]);

  // check if the mentor leave the chat and navigate all of the students to the lobby
  useEffect(() => {
    const socket = socketRef.current;

    if (socket) {
      socket.on("mentorLeft", () => {
        if (role === "student") {
          navigate("/");
          alert("mentor has left the room");
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  // change the code when the student edit and broadcast it to the other users in the room
  const handleChange = (updateCode: string | undefined) => {
    setCode(updateCode);

    if (socketRef.current) {
      socketRef.current.emit("codeUpdate", updateCode);
    }
  };

  // render a smile on the screen if the solution is currect and its a student
  const Message = () => {
    if (code === solution && role === "student") {
      return (
        <div className="messageContainer">
          <FaRegSmileBeam style={{ color: "wheat" }} size="10rem" />
          <button onClick={() => navigate("/")}>Go back</button>
        </div>
      );
    }
    if (code === solution && role === "mentor") {
      return (
        <div className="messageContainer">
          <p>The students have solved the problem. ✅</p>
          <button onClick={() => navigate("/")}>Go back</button>
        </div>
      );
    }
  };

  return (
    <div id="codeBlock">
      <h1>Code block: {id}</h1>
      <h3>Role: {role}</h3>
      <h3>Number of students in the room: {studentsCount}</h3>
      <Editor
        height="90vh"
        theme="vs-dark"
        defaultLanguage="javascript"
        loading
        defaultValue={code}
        value={code}
        options={{
          readOnly: role === "mentor" || solution === code,
          minimap: {
            enabled: false,
          },
          fontSize: 20,
          renderValidationDecorations: "off",
          parameterHints: {
            enabled: false,
          },
          suggestOnTriggerCharacters: false,
          codeLens: false,
        }}
        onChange={(updateCode) => handleChange(updateCode)}
      />
      <Message />
    </div>
  );
};

export default CodeBlock;
