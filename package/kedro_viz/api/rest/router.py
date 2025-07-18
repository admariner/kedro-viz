"""`kedro_viz.api.rest.router` defines REST routes and handling logic."""

import logging

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from kedro_viz.api.rest.requests import DeployerConfiguration
from kedro_viz.api.rest.responses.base import APINotFoundResponse
from kedro_viz.api.rest.responses.metadata import (
    MetadataAPIResponse,
    get_metadata_response,
)
from kedro_viz.api.rest.responses.nodes import (
    NodeMetadataAPIResponse,
    get_node_metadata_response,
)
from kedro_viz.api.rest.responses.pipelines import (
    GraphAPIResponse,
    get_pipeline_response,
)
from kedro_viz.api.rest.responses.run_events import (
    RunStatusAPIResponse,
    get_run_status_response,
)
from kedro_viz.api.rest.responses.version import (
    VersionAPIResponse,
    get_version_response,
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api",
    responses={404: {"model": APINotFoundResponse}},
)


@router.get("/main", response_model=GraphAPIResponse)
async def main():
    return get_pipeline_response()


@router.get(
    "/nodes/{node_id}",
    response_model=NodeMetadataAPIResponse,
    response_model_exclude_none=True,
)
async def get_single_node_metadata(node_id: str):
    return get_node_metadata_response(node_id)


@router.get(
    "/pipelines/{registered_pipeline_id}",
    response_model=GraphAPIResponse,
)
async def get_single_pipeline_data(registered_pipeline_id: str):
    return get_pipeline_response(registered_pipeline_id)


@router.get(
    "/version",
    response_model=VersionAPIResponse,
)
async def get_version():
    return get_version_response()


@router.get("/run-status", response_model=RunStatusAPIResponse)
async def get_last_run_status():
    """Get run status data for pipeline visualization.

    This endpoint provides access to Kedro pipeline run status in structured format.

    Returns:
        JSON response containing run status data in structured format

    Example structured format:
    ```
    {
        "nodes": {
            "node_id": {
                "status": "success",
                "duration": 0.123,
                "error": null
            }
        },
        "datasets": {
            "dataset_id": {
                "name": "dataset.name",
                "size": 1024,
                "error": null
            }
        },
        "pipeline": {
            "run_id": "unique-id",
            "start_time": "2023-05-14T10:15:30Z",
            "end_time": "2023-05-14T10:20:45Z",
            "duration": 315.25,
            "status": "completed"
            "error": null
        }
    }
    ```
    """
    try:
        return get_run_status_response()
    except Exception as exc:
        logger.exception("An exception occurred while getting run status: %s", exc)
        return JSONResponse(
            status_code=500,
            content={"message": "Failed to get run status data"},
        )


@router.post("/deploy")
async def deploy_kedro_viz(input_values: DeployerConfiguration):
    from kedro_viz.integrations.deployment.deployer_factory import DeployerFactory

    try:
        from azure.core.exceptions import ServiceRequestError
    except ImportError:  # pragma: no cover
        ServiceRequestError = None  # type: ignore

    try:
        deployer = DeployerFactory.create_deployer(
            input_values.platform, input_values.endpoint, input_values.bucket_name
        )
        deployer.deploy(input_values.is_all_previews_enabled)
        response = {
            "message": "Website deployed on "
            f"{input_values.platform and input_values.platform.upper()}",
            "url": input_values.endpoint,
        }
        return JSONResponse(status_code=200, content=response)
    except PermissionError as exc:  # pragma: no cover
        logger.exception("Permission error in deploying Kedro Viz : %s ", exc)
        return JSONResponse(
            status_code=401, content={"message": "Please provide valid credentials"}
        )
    except (
        (FileNotFoundError, ServiceRequestError)
        if ServiceRequestError is not None
        else FileNotFoundError
    ) as exc:  # pragma: no cover
        logger.exception("FileNotFoundError while deploying Kedro Viz : %s ", exc)
        return JSONResponse(
            status_code=400, content={"message": "The specified bucket does not exist"}
        )
    except Exception as exc:  # pragma: no cover
        logger.exception("Deploying Kedro Viz failed: %s ", exc)
        return JSONResponse(status_code=500, content={"message": f"{exc}"})


@router.get(
    "/metadata",
    response_model=MetadataAPIResponse,
)
async def get_metadata():
    try:
        return get_metadata_response()
    except Exception as exc:
        logger.exception("An exception occurred while getting app metadata: %s", exc)
        return JSONResponse(
            status_code=500,
            content={"message": "Failed to get app metadata"},
        )
