import React, { useState, useRef,useContext } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import Timer from "./timer.component";
import { UserContext } from "../App";
import { Toaster,toast } from "react-hot-toast";

const CodeEditor = ({ question }) => {
  const { value,solution } = question;
  const editorRef = useRef(null);
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false); 
  const [error, setError] = useState(null); 
  const [success, setSuccess] = useState(false);

  let {
    userAuth: { access_token },
  } = useContext(UserContext);


  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  function getEditorValue() {
    setIsLoading(true); 
    setError(null); 

    const code = editorRef.current.getValue();
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/run", {
        language: "py",
        code,
      })
      .then((response) => {
        console.log(response.data.output); 
        setOutput(response.data.output);
        if (response.data.output.trim() === solution.trim()) {
          setSuccess(true); 
        } else {
          setSuccess(false);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        setError("An error occurred while running the code."); 
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  const handleSubmission = () => {
    setIsLoading(true);
    setError(null);
    const answer = editorRef.current.getValue();
    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/create-submission",
        {
          questionId: question._id,
          answer,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then((response) => {
        setSuccess(true);
        toast.success("your code submitted successfully !");
      })
      .catch((error) => {
        console.error("Error:", error);
        setError("An error occurred while submitting the code.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };


  return (
    <>
    <div className="border-b border-slate pb-4 mb-4 bg-slate">
      <button
        className={`mt-5 ml-5 whitespace-nowrap bg-green text-custom rounded-full py-2 px-5 text-base capitalize hover:bg-opacity-80 ${
          isLoading && "opacity-50 pointer-events-none"
        }`}
        onClick={getEditorValue}
        disabled={isLoading}
      >
        <i className="fi fi-rr-play mr-2"></i>
        {isLoading ? "Running..." : "Run"}{" "}
       
      </button>
      <button className="mt-5 ml-3 whitespace-nowrap bg-green3 text-custom rounded-full py-2 px-5 text-base capitalize hover:bg-opacity-80"
       onClick={handleSubmission}
       disabled={isLoading}
      >
        <i className="fi fi-rr-cloud-upload-alt mr-2"></i>
        {isLoading ? "Submitting..." : "Submit"}
      </button>
      <Timer/>
      </div>
      <Editor
        className="-ml-40"
        theme="vs-light"
        height="59vh"
        width="148%" 
        onMount={handleEditorDidMount}
        defaultLanguage="python"
        defaultValue={value}
      />
      <div className="mt-4 bg-slate px-6 py-4">
        <p className="font-medium">Output</p>
        {error ? ( 
          <p className="text-red">{error}</p>
        ) : (
          <>
          <pre>{output}</pre>
          {success && (
            <p className="text-green2">
              Congrats! Your code is correct. All test cases passed! You can go ahead and submit the code now.
            </p>
          )}

        </>
        )}
      </div>
    </>
  );
};

export default CodeEditor;
