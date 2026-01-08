import os
import asyncio
from dotenv import load_dotenv
from loguru import logger

from pipecat.audio.vad.silero import SileroVADAnalyzer
from pipecat.audio.vad.vad_analyzer import VADParams
from pipecat.audio.turn.smart_turn.local_smart_turn_v3 import LocalSmartTurnAnalyzerV3
from pipecat.frames.frames import EndFrame, LLMRunFrame
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineParams, PipelineTask
from pipecat.processors.aggregators.llm_context import LLMContext
from pipecat.processors.aggregators.llm_response_universal import LLMContextAggregatorPair
from pipecat.services.cartesia.tts import CartesiaTTSService
from pipecat.services.deepgram.stt import DeepgramSTTService
from pipecat.services.google.llm import GoogleLLMService
# from pipecat.services.groq import GroqLLMService
from pipecat.services.groq.llm import GroqLLMService
from pipecat.transports.base_transport import BaseTransport, TransportParams
from pipecat.transports.daily.transport import DailyTransport, DailyParams
from pipecat.runner.types import RunnerArguments, DailyRunnerArguments

# Flow imports
from pipecat_flows import FlowManager, NodeConfig, FlowsFunctionSchema
from pipecat.services.llm_service import FunctionCallParams

load_dotenv(override=True)

# 1. Flow Handlers (Defining how to move between nodes)
# async def transition_to_interview(args: FunctionCallParams, flow_manager: FlowManager):
#     await flow_manager.set_node("interview")

# async def end_the_call(args: FunctionCallParams, flow_manager: FlowManager):
#     await flow_manager.set_node("exit")

async def transition_to_interview(args: FunctionCallParams, flow_manager: FlowManager):
    return "interview"  # Just return the name of the next node

async def end_the_call(args: FunctionCallParams, flow_manager: FlowManager):
    return "exit"

async def run_bot(transport: BaseTransport):
    logger.info("Starting Senior Interviewer Bot")

    stt = DeepgramSTTService(api_key=os.getenv("DEEPGRAM_API_KEY"))
    
    # Authoritative Voice (Orion)
    tts = CartesiaTTSService(
        api_key=os.getenv("CARTESIA_API_KEY"),
        voice_id="694f9389-aac1-45b6-b726-9d9369183238" 
    )


    # Inside run_bot():
    llm = GroqLLMService(
        api_key=os.getenv("GROQ_API_KEY"),
        model="llama-3.3-70b-versatile" # This model is excellent for interviews
    )
    # llm = GoogleLLMService(
    #     api_key=os.getenv("GOOGLE_API_KEY"),
    #     model=os.getenv("GOOGLE_MODEL", "gemini-2.0-flash")
    # )

    # 2. Authority Flow Configuration
    flow_config = {
        "initial_node": "greeting",
        "nodes": {
            "greeting": NodeConfig(
                role_messages=[{
                    "role": "system", 
                    "content": "You are Alex, a Senior Recruiter. Your tone is professional, authoritative, and steady."
                }],
                task_messages=[{
                    "role": "system", 
                    "content": "Greet the user: 'Hello, I am Alex. Thank you for joining. Please tell me your name and the role you are applying for.' Once they answer, call 'transition_to_interview'."
                }],
                functions=[FlowsFunctionSchema(
                    name="transition_to_interview",
                    handler=transition_to_interview,
                    description="Move to the interview questions after introduction",
                    properties={},
                    required=[]
                )]
            ),
            "interview": NodeConfig(
                task_messages=[{
                    "role": "system", 
                    "content": "Ask exactly two questions: 1. Their biggest achievement. 2. Their preferred work environment. After both are answered, call 'end_the_call'."
                }],
                functions=[FlowsFunctionSchema(
                    name="end_the_call",
                    handler=end_the_call,
                    description="Finish the interview session",
                    properties={},
                    required=[]
                )]
            ),
            "exit": NodeConfig(
                task_messages=[{
                    "role": "system", 
                    "content": "Say: 'Thank you. We have what we need. Our team will contact you soon. Goodbye.' Then end the call."
                }],
                post_actions=[EndFrame()]
            )
        }
    }

    context = LLMContext()
    context_aggregator = LLMContextAggregatorPair(context)
    
    pipeline = Pipeline([
        transport.input(),
        stt,
        context_aggregator.user(),
        llm,
        tts,
        transport.output(),
        context_aggregator.assistant(),
    ])

    task = PipelineTask(pipeline, params=PipelineParams(allow_interruptions=True))

    # 3. FIX: Initializing with Keyword Arguments
    flow_manager = FlowManager(
        flow_config=flow_config,
        task=task,
        llm=llm,
        context_aggregator=context_aggregator
    )
    
    await flow_manager.initialize()

    @transport.event_handler("on_client_connected")
    async def on_client_connected(transport, client):
        # Initial greeting from Alex
        await task.queue_frames([LLMRunFrame()])

    runner = PipelineRunner(handle_sigint=False)
    await runner.run(task)

async def bot(runner_args: RunnerArguments):
    if isinstance(runner_args, DailyRunnerArguments):
        transport = DailyTransport(
            runner_args.room_url,
            runner_args.token,
            "Senior Recruiter (Alex)",
            params=DailyParams(
                audio_in_enabled=True,
                audio_out_enabled=True,
                vad_analyzer=SileroVADAnalyzer(params=VADParams(stop_secs=0.3)),
                turn_analyzer=LocalSmartTurnAnalyzerV3(),
            ),
        )
        await run_bot(transport)

if __name__ == "__main__":
    from pipecat.runner.run import main
    main()