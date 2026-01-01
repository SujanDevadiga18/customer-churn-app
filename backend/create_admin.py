import sys
import os
from passlib.context import CryptContext
from sqlalchemy.orm import Session

# Add current directory to path so we can import backend modules
sys.path.append(os.getcwd())

from backend.database.session import SessionLocal
from backend.database.schema import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def create_admin(username, email, password):
    db: Session = SessionLocal()
    try:
        # Check if user exists
        existing_user = db.query(User).filter(User.username == username).first()
        if existing_user:
            print(f"Error: User '{username}' already exists.")
            return
        
        existing_email = db.query(User).filter(User.email == email).first()
        if existing_email:
            print(f"Error: Email '{email}' already exists.")
            return

        hashed_pwd = get_password_hash(password)
        admin_user = User(username=username, email=email, hashed_password=hashed_pwd, role="admin")
        
        db.add(admin_user)
        db.commit()
        print(f"Success! Admin user '{username}' with email '{email}' created.")
        
    except Exception as e:
        print(f"Error creating admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python backend/create_admin.py <username> <email> <password>")
        sys.exit(1)
    
    username = sys.argv[1]
    email = sys.argv[2]
    password = sys.argv[3]
    create_admin(username, email, password)
