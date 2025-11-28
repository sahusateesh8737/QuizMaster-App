from alembic.config import Config
import os

config = Config("alembic.ini")
print(f"Config file: {config.config_file_name}")
print(f"Script location: {config.get_main_option('script_location')}")
print(f"CWD: {os.getcwd()}")
