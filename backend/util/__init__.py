# pip install selenium
# pip install -U user_agent
# pip install user-agents
# pip install webdriver_manager
from bs4 import BeautifulSoup
from user_agent import generate_user_agent
from user_agents import parse
from selenium import webdriver  # 자동화 툴
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from tqdm import tqdm
import time  # 시간 지연
import pandas as pd
import random
import warnings
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
import datetime
import re
import pandas as pd
from sentence_transformers import SentenceTransformer
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import PCA
from konlpy.tag import Okt
import torch
from transformers import AutoTokenizer,AutoModel


warnings.filterwarnings('ignore')

__all__ = [
    "parse","generate_user_agent","pd",
    "tqdm","BeautifulSoup","webdriver","Service",
    "ChromeDriverManager","By","time","random","EC",
    "WebDriverWait","datetime","re","pd","SentenceTransformer","np",
    "cosine_similarity","PCA","Okt","torch","AutoTokenizer","AutoModel"
]