import "./Modal.scss";

function Modal(props) {
  return (
    <div className="Modal" {...props}>
      { props.children }
    </div>
  );
}

export default Modal;