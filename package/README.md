# Kedro-Viz

<br />
<p align="center">

![Kedro-Viz Pipeline Visualisation](https://raw.githubusercontent.com/kedro-org/kedro-viz/main//banner.gif)
</p>

<p align="center">
✨ <em> Data Science Pipelines. Beautifully Designed</em> ✨
<br />
Live Demo: <a href="https://demo.kedro.org/" target="_blank">https://demo.kedro.org/</a>
</p>

<br />

[![GitHub Actions](https://img.shields.io/github/actions/workflow/status/kedro-org/kedro-viz/merge-gatekeeper.yml?label=Actions&logo=github)](https://github.com/kedro-org/kedro-viz/actions)
[![Documentation](https://readthedocs.org/projects/kedro/badge/?version=stable)](https://docs.kedro.org/en/stable/visualisation/)
[![Python Version](https://img.shields.io/badge/python-3.9%20%7C%203.10%20%7C%203.11-orange.svg)](https://pypi.org/project/kedro-viz/)
[![PyPI version](https://img.shields.io/pypi/v/kedro-viz.svg?color=yellow)](https://pypi.org/project/kedro-viz/)
[![Downloads](https://static.pepy.tech/badge/kedro-viz/week)](https://pepy.tech/project/kedro-viz)
[![npm version](https://img.shields.io/npm/v/@quantumblack/kedro-viz.svg?color=cc3534)](https://badge.fury.io/js/%40quantumblack%2Fkedro-viz)
[![License](https://img.shields.io/badge/license-Apache%202.0-3da639.svg)](https://opensource.org/licenses/Apache-2.0)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Slack Organisation](https://img.shields.io/badge/slack-chat-blueviolet.svg?label=Kedro%20Slack&logo=slack)](https://slack.kedro.org)

## Introduction

Kedro-Viz is an interactive development tool for building data science pipelines with [Kedro](https://github.com/kedro-org/kedro).

## Features

- ✨ Complete visualisation of a Kedro project and its pipelines
- 🎨 Supports light & dark themes out of the box
- 🚀 Scales to big pipelines with hundreds of nodes
- 🔎 Highly interactive, filterable and searchable
- 🔬 Focus mode for modular pipeline visualisation
- 📊 Rich metadata side panel to display parameters, plots, etc.
- 📊 Supports all types of [Plotly charts](https://plotly.com/javascript/)
- ♻️ Autoreload on code change
- 🎩 Many more to come

## Installation

There are two ways you can use Kedro-Viz:

- As a [Kedro plugin](https://docs.kedro.org/en/stable/extend_kedro/plugins.html) (the most common way).

  To install Kedro-Viz as a Kedro plugin:

  ```bash
  pip install kedro-viz
  ```

- As a standalone React component (for embedding Kedro-Viz in your web application).

  To install the standalone React component:

  ```bash
  npm install @quantumblack/kedro-viz
  ```

## Usage

#### Compatibility with Kedro and Kedro-datasets   

Ensure your `Kedro`, `Kedro-Viz` and `Kedro-datasets` versions are supported by referencing the following table:

<table>
    <tr>
        <th>Python Version</th>
        <th style="text-align: center" colspan="3">Last Supported</th>
    </tr>
    <tr>
        <td></td>
        <td>Kedro</td>
        <td>Kedro-Viz</td>
        <td>Kedro-datasets</td>
    </tr>
    <tr>
        <td>3.6</td>
        <td>0.17.7</td>
        <td>4.1.1</td>
        <td>-</td>
    </tr>
    <tr>
        <td>3.7</td>
        <td>0.18.14</td>
        <td>6.7.0</td>
        <td>1.8.0</td>
    </tr>
    <tr>
        <td>3.8</td>
        <td>Latest</td>
        <td>7.1.0</td>
        <td>1.8.0</td>
    </tr>
    <tr>
        <td>3.9</td>
        <td>Latest</td>
        <td>Latest</td>
        <td>5.0.0</td>
    </tr>
    <tr>
        <td>>= 3.10</td>
        <td>Latest</td>
        <td>Latest</td>
        <td>Latest</td>
    </tr>
</table>​


### CLI Usage

To launch Kedro-Viz from the command line as a Kedro plugin, use the following command from the root folder of your Kedro project:

```bash
kedro viz run
```

A browser tab opens automatically to serve the visualisation at `http://127.0.0.1:4141/`.

Kedro-Viz also supports the following additional arguments on the command line:

```bash
Usage: kedro viz run [OPTIONS]

  Visualise a Kedro pipeline using Kedro-Viz.

Options:
  --host TEXT               Host that viz will listen to. Defaults to
                            localhost.

  --port INTEGER            TCP port that viz will listen to. Defaults to
                            4141.

  --browser / --no-browser  Whether to open viz interface in the default
                            browser or not. Browser will only be opened if
                            host is localhost. Defaults to True.

  --load-file FILE          Path to load Kedro-Viz data from a directory
  --save-file FILE          Path to save Kedro-Viz data to a directory 
  -p, --pipeline TEXT       Name of the registered pipeline to visualise. If not
                            set, the default pipeline is visualised

  -e, --env TEXT            Kedro configuration environment. If not specified,
                            catalog config in `local` will be used

  --autoreload              Autoreload viz server when a Python or YAML file change in
                            the Kedro project

  --include-hooks           A flag to include all registered hooks in your
                            Kedro Project

  --params TEXT             Specify extra parameters that you want to pass to
                            the context initializer. Items must be separated
                            by comma, keys - by colon, example:
                            param1:value1,param2:value2. Each parameter is
                            split by the first comma, so parameter values are
                            allowed to contain colons, parameter keys are not.
                            To pass a nested dictionary as parameter, separate
                            keys by '.', example: param_group.param1:value1.

  --lite                    An experimental flag to open Kedro-Viz without Kedro
                            project dependencies.

  -h, --help                Show this message and exit.
```

To deploy Kedro-Viz from the command line as a Kedro plugin, use the following command from the root folder of your Kedro project:

```bash
kedro viz deploy
```

```bash
Usage: kedro viz deploy [OPTIONS]

  Deploy and host Kedro Viz on AWS S3.

Options:
  --platform TEXT     Supported Cloud Platforms like ('aws', 'azure', 'gcp')
                      to host Kedro Viz  [required]
  --endpoint TEXT     Static Website hosted endpoint.(eg., For AWS - http://<b
                      ucket_name>.s3-website.<region_name>.amazonaws.com/)
                      [required]
  --bucket-name TEXT  Bucket name where Kedro Viz will be hosted  [required]
  --include-hooks     A flag to include all registered hooks in your Kedro
                      Project
  --include-previews  A flag to include preview for all the datasets
  -h, --help          Show this message and exit.
```

To create a build directory of your local Kedro-Viz instance with static data from the command line, use the following command from the root folder of your Kedro project:

```bash
kedro viz build
```

```bash
Usage: kedro viz build [OPTIONS]

  Create build directory of local Kedro Viz instance with Kedro project data

Options:
  --include-hooks     A flag to include all registered hooks in your Kedro
                      Project
  --include-previews  A flag to include preview for all the datasets
  -h, --help          Show this message and exit.
```
### Standalone React component usage

To use Kedro-Viz as a standalone React component, you can follow the example below. However, please note that Kedro-Viz does not support server-side rendering (SSR). If you're using Next.js or another SSR framework, you should be aware of this limitation.

```javascript
import KedroViz from '@quantumblack/kedro-viz';
import '@quantumblack/kedro-viz/lib/styles/styles.min.css';

const MyApp = () => (
  <div style={{height: `100vh`}}>
    <KedroViz
      data={json}
      options={/* Options to configure Kedro Viz */}
    />
  </div>
);
```

To use with NextJS:

```javascript
import '@quantumblack/kedro-viz/lib/styles/styles.min.css';
import dynamic from 'next/dynamic';

const NoSSRKedro = dynamic(() => import('@quantumblack/kedro-viz'), {
  ssr: false,
});

const MyApp = () => <NoSSRKedro data={json} />;
```

The JSON can be obtained by running:

```bash
kedro viz run --save-file=filename
```

We also recommend wrapping the `Kedro-Viz` component with a parent HTML/JSX element that has a specified height (as seen in the above example) in order for Kedro-Viz to be styled properly.

For more information on how to use Kedro-Viz as a React component, follow this [guide](https://www.npmjs.com/package/@quantumblack/kedro-viz)

**_Our documentation contains [additional examples on how to visualise with Kedro-Viz.](https://docs.kedro.org/en/stable/visualisation/index.html)_**

## Kedro-Viz in Visual Studio Code Extension

To visualize Kedro project using Kedro-Viz in Visual Studio Code, please install Kedro extension in Visual Studio Code.

For more information on how to use Kedro-Viz in Visual Studio Code, follow this [guide](https://marketplace.visualstudio.com/items?itemName=kedro.Kedro)

## Feature Flags

Kedro-Viz uses features flags to roll out some experimental features. No feature flags are currently in use.

To enable or disable a flag, click on the settings icon in the toolbar and toggle the flag on/off.

Kedro-Viz also logs a message in your browser's [developer console](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/What_are_browser_developer_tools#The_JavaScript_console) to show the available flags and their values as currently set on your machine.


## Python version support policy
Kedro Viz supports all Python versions that are actively maintained by the CPython core team. When a [Python version reaches end of life](https://devguide.python.org/versions/#versions), support for that version is dropped from Kedro-viz. This is not considered a breaking change.

## Maintainers

Kedro-Viz is maintained by the [Kedro team](https://docs.kedro.org/en/stable/contribution/technical_steering_committee.html#kedro-maintainers) and a number of [contributors from across the world](https://github.com/kedro-org/Kedro-Viz/contributors).

## Contribution

If you want to contribute to Kedro-Viz, please check out our [contributing guide](./CONTRIBUTING.md).

## License

Kedro-Viz is licensed under the [Apache 2.0](https://github.com/kedro-org/kedro-viz/blob/main/LICENSE.md) License.

## Citation

If you're an academic, Kedro-Viz can also help you, for example, as a tool to visualise how your publication's pipeline is structured. Find our citation reference on [Zenodo](https://doi.org/10.5281/zenodo.4277218).