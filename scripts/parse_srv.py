from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from postal.parser import parse_address

app = FastAPI()

class ParseRequest(BaseModel):
    raw: str

@app.post("/parse")
def parse_endpoint(req: ParseRequest):
    if not req.raw:
        raise HTTPException(status_code=400, detail="raw field must not be empty")
    # libpostal returns (value, component) tuples – convert to label:value mapping
    components = {label: value for value, label in parse_address(req.raw)}
    return {"components": components} 