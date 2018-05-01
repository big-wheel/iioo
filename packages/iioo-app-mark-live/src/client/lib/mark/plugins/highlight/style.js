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
  margin: auto 2px;
  border-radius: 50%;
  cursor: pointer;
}

.mark-highlight-active-color {
  background-size: contain;
  background-image: url("data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNTI1MTM3NDcxNDM5IiBjbGFzcz0iaWNvbiIgc3R5bGU9IiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjIwNDYiIGRhdGEtc3BtLWFuY2hvci1pZD0iYTMxM3guNzc4MTA2OS4wLmkwIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiPjxkZWZzPjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+PC9zdHlsZT48L2RlZnM+PHBhdGggZD0iTTE3Ni42NjE2MDEgODE3LjE3Mjg4MUMxNjguNDcyNzk4IDgyNS42NDQwNTUgMTY4LjcwMTcwNiA4MzkuMTQ5NjM2IDE3Ny4xNzI4ODEgODQ3LjMzODQzOCAxODUuNjQ0MDU2IDg1NS41MjcyNDEgMTk5LjE0OTYzNiA4NTUuMjk4MzMyIDIwNy4zMzg0MzggODQ2LjgyNzE1N0w4MjYuMDA1MTA1IDIwNi44MjcxNTdDODM0LjE5MzkwNyAxOTguMzU1OTgzIDgzMy45NjQ5OTggMTg0Ljg1MDQwMyA4MjUuNDkzODI0IDE3Ni42NjE2MDEgODE3LjAyMjY1IDE2OC40NzI3OTggODAzLjUxNzA2OSAxNjguNzAxNzA2IDc5NS4zMjgyNjcgMTc3LjE3Mjg4MUwxNzYuNjYxNjAxIDgxNy4xNzI4ODFaIiBwLWlkPSIyMDQ3Ij48L3BhdGg+PHBhdGggZD0iTTc5NS4zMjgyNjcgODQ2LjgyNzE1N0M4MDMuNTE3MDY5IDg1NS4yOTgzMzIgODE3LjAyMjY1IDg1NS41MjcyNDEgODI1LjQ5MzgyNCA4NDcuMzM4NDM4IDgzMy45NjQ5OTggODM5LjE0OTYzNiA4MzQuMTkzOTA3IDgyNS42NDQwNTUgODI2LjAwNTEwNSA4MTcuMTcyODgxTDIwNy4zMzg0MzggMTc3LjE3Mjg4MUMxOTkuMTQ5NjM2IDE2OC43MDE3MDYgMTg1LjY0NDA1NiAxNjguNDcyNzk4IDE3Ny4xNzI4ODEgMTc2LjY2MTYwMSAxNjguNzAxNzA2IDE4NC44NTA0MDMgMTY4LjQ3Mjc5OCAxOTguMzU1OTgzIDE3Ni42NjE2MDEgMjA2LjgyNzE1N0w3OTUuMzI4MjY3IDg0Ni44MjcxNTdaIiBwLWlkPSIyMDQ4Ij48L3BhdGg+PC9zdmc+");
}
.mark-highlight-color:hover {
  opacity: .68;
}
.mark-highlight-color.disabled {
  cursor: not-allowed;
  opacity: .5;
}
.mark-highlight-item {
  cursor: pointer;
}
`
