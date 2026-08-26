import os
from dotenv import load_dotenv
from openai import OpenAI

# .env 로드
load_dotenv()

base_url = os.getenv("OPENAI_BASE_URL", "http://localhost:20128/v1")
api_key = os.getenv("OPENAI_API_KEY")

print(f"Connecting to OmniRoute at: {base_url}")

client = OpenAI(
    base_url=base_url,
    api_key=api_key
)

try:
    # 기본 모델 호출 테스트 (OmniRoute 대시보드에서 활성화된 모델 이름으로 변경 가능)
    response = client.chat.completions.create(
        model="gpt-4o",  # 또는 claude-3-7-sonnet, deepseek-chat 등
        messages=[
            {"role": "user", "content": "Hello OmniRoute! 간단히 1문장으로 인사해줘."}
        ]
    )
    print("Response from OmniRoute:")
    print(response.choices[0].message.content)
except Exception as e:
    print(f"Error connecting to OmniRoute: {e}")
