import { useEffect, useState } from "react";
import { connect } from "react-redux";
import "./ErrorMessage.scss";

function ErrorMessage({ error }) {
  const [ hiddenClass, setHiddenClass ] = useState("hidden");
  const errorDuration = 5000;

  useEffect(() => {
    if (error.message) {
      setHiddenClass("");
      setTimeout(() => {
        setHiddenClass("hidden");
      }, errorDuration);
    } else {
      setHiddenClass("hidden");
    }
  }, [ error ]);

  return (
    <div className={ "ErrorMessage " + hiddenClass }>
      { error.message }
    </div>
  )
}

const mapStateToProps = state => {
  return state;
}

const mapDispatchToProps = dispatch => {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(ErrorMessage);