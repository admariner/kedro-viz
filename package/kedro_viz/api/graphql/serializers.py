"""`kedro_viz.api.graphql.serializers` defines serializers to create strawberry types
from the underlying domain models."""

from __future__ import annotations

import json
from collections import defaultdict
from typing import Dict, Iterable, List, Optional, cast

from strawberry import ID

from kedro_viz.models.experiment_tracking import RunModel, UserRunDetailsModel

from .types import Run


def format_run(
    run_id: str, run_blob: Dict, user_run_details: Optional[UserRunDetailsModel] = None
) -> Run:
    """Convert blob data in the correct Run format.
    Args:
        run_id: ID of the run to fetch
        run_blob: JSON blob of run metadata
        user_run_details: The user run details associated with this run
    Returns:
        Run object
    """
    git_data = run_blob.get("git")
    bookmark = user_run_details.bookmark if user_run_details else False
    title = (
        user_run_details.title
        if user_run_details and user_run_details.title
        else run_id
    )
    notes = (
        user_run_details.notes if user_run_details and user_run_details.notes else ""
    )
    run = Run(
        author=run_blob.get("username"),
        bookmark=bookmark,
        git_branch=git_data.get("branch") if git_data else None,
        git_sha=git_data.get("commit_sha") if git_data else None,
        id=ID(run_id),
        notes=notes,
        run_command=run_blob.get("cli", {}).get("command_path"),
        title=title,
    )
    return run


def format_runs(
    runs: Iterable[RunModel],
    user_run_details: Optional[Dict[str, UserRunDetailsModel]] = None,
) -> List[Run]:
    """Format a list of RunModel objects into a list of GraphQL Run.

    Args:
        runs: The collection of RunModels to format.
        user_run_details: the collection of user_run_details associated with the given runs.
    Returns:
        The list of formatted Runs.
    """
    if not runs:  # it could be None in case the db isn't there.
        return []
    return [
        format_run(
            run.id,
            json.loads(cast(str, run.blob)),
            user_run_details.get(run.id) if user_run_details else None,
        )
        for run in runs
    ]


def format_run_tracking_data(
    tracking_data: Dict, show_diff: Optional[bool] = True
) -> Dict:
    """Convert tracking data in the front-end format.

    Args:
        tracking_data: JSON blob of tracking data for selected runs
        show_diff: If false, show runs with only common tracking
            data; else show all available tracking data
    Returns:
        Dictionary with formatted tracking data for selected runs

    Example:
        >>> from kedro.extras.datasets.tracking import MetricsDataSet
        >>> tracking_data = {
        >>>     'My Favorite Sprint': {
        >>>         'bootstrap':0.8
        >>>         'classWeight":23
        >>>     },
        >>>     'Another Favorite Sprint': {
        >>>         'bootstrap':0.5
        >>>         'classWeight":21
        >>>     },
        >>>     'Slick test this one': {
        >>>         'bootstrap':1
        >>>         'classWeight":21
        >>>     },
        >>> }
        >>> format_run_tracking_data(tracking_data, False)
        {
            bootstrap: [
                { runId: 'My Favorite Run', value: 0.8 },
                { runId: 'Another favorite run', value: 0.5 },
                { runId: 'Slick test this one', value: 1 },
            ],
            classWeight: [
                { runId: 'My Favorite Run', value: 23 },
                { runId: 'Another favorite run', value: 21 },
                { runId: 'Slick test this one', value: 21 },
            ]
        }

    """
    formatted_tracking_data = defaultdict(list)

    for run_id, run_tracking_data in tracking_data.items():
        for tracking_name, data in run_tracking_data.items():
            formatted_tracking_data[tracking_name].append(
                {"runId": run_id, "value": data}
            )
    if not show_diff:
        for tracking_key, run_tracking_data in list(formatted_tracking_data.items()):
            if len(run_tracking_data) != len(tracking_data):
                del formatted_tracking_data[tracking_key]

    return formatted_tracking_data