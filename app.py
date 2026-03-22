"""Scrapcore Streamlit entrypoint."""

from __future__ import annotations

import streamlit as st

from game.state import init_game
from game.ui import render_app


st.set_page_config(page_title="Scrapcore", page_icon="⚙️", layout="centered")
init_game()
render_app()
