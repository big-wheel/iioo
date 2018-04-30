module.exports = `
.mark-highlight-popover {
  position: absolute;
  z-index: 9999;
  background-color: #fff;
  box-shadow: 0 0 10px 3px #ccc;
  transform: translate(-54%, 20%);
  min-width: 40px;
  max-width: 90vw;
  padding: 4px 7px;
  box-sizing: content-box;
  text-align: center;
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
}
.mark-highlight-popover::before {
  content: "";
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid transparent;
  border-bottom: 5px solid #fff;
  display: block;
  position: absolute;
  top: -10px;
  left: 50%;
}
.mark-highlight-color {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  cursor: pointer;
}
.mark-highlight-color:hover {
  opacity: .68;
}
.mark-highlight-color.disabled {
  cursor: not-allowed;
  opacity: .5;
}
`
