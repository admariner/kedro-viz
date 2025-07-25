//--- Useful JS utility functions ---//
const pathRoot = './api';

/**
 * Loop through an array and output to an object
 * @param {Array} array
 * @param {Function} callback
 */
export const arrayToObject = (array, callback) => {
  const newObject = {};
  array.forEach((key) => {
    newObject[key] = callback(key);
  });
  return newObject;
};

/**
 * Determine the endpoint URL for loading different data types
 * @param {String} type Data type
 * @param {String=} id Endpoint identifier e.g. pipeline ID
 */
export const getUrl = (type, id) => {
  switch (type) {
    case 'main':
      return [pathRoot, 'main'].join('/');
    case 'pipeline':
      if (!id) {
        throw new Error('No pipeline ID provided');
      }
      return [pathRoot, 'pipelines', id].join('/');
    case 'nodes':
      if (!id) {
        throw new Error('No node ID provided');
      }
      return [pathRoot, 'nodes', id].join('/');
    default:
      throw new Error('Unknown URL type');
  }
};

/**
 * Filter duplicate values from an array
 * @param {any} d Datum
 * @param {Number} i Index
 * @param {Array} arr The array to remove duplicate values from
 */
export const unique = (d, i, arr) => arr.indexOf(d) === i;

/**
 * Returns true if any of the given props are different between given objects.
 * Only shallow changes are detected.
 * @param {Array} props The prop names to check
 * @param {Object} objectA The first object
 * @param {Object} objectB The second object
 * @returns {Boolean} True if any prop changed else false
 */
export const changed = (props, objectA, objectB) => {
  return (
    objectA && objectB && props.some((prop) => objectA[prop] !== objectB[prop])
  );
};

/**
 * Replace any parts of a string that match the keys in the toReplace object
 * @param {String} str The string to check
 * @param {Object} toReplace The object of strings to replace and their replacements
 * @returns {String} The string with or without replaced values
 */
export const replaceMatches = (str, toReplace) => {
  if (str?.length > 0) {
    const regex = new RegExp(Object.keys(toReplace).join('|'), 'gi');

    return str.replace(regex, (matched) => {
      return toReplace[matched];
    });
  } else {
    return str;
  }
};

/**
 * Replace any parts of a string that match the '<' & '>' except '<b>' & '</b>'
 * @param {String} str The string to check
 * @returns {String} The string with or without replaced values
 */
export const replaceAngleBracketMatches = (str) => {
  if (str?.length > 0) {
    // Handling string like '<lambda>' or '<partial>' in 3 steps
    // 1. replacing all '<b>' & '</b>' with unique '@$1$@' & '@$2$@' respectively
    // 2. replacing all '<' & '>' with '&lt;' & '&gt;' respectively
    // 3. replacing back all '@$1$@' & '@$2$@' with <b> & </b> respectively
    const strWithoutBTag = str
      .replaceAll('<b>', '@$1$@')
      .replaceAll('</b>', '@$2$@');
    const replacedWithAngleBracket = strWithoutBTag
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
    const result = replacedWithAngleBracket
      .replaceAll('@$1$@', '<b>')
      .replaceAll('@$2$@', '</b>');

    return result;
  } else {
    return str;
  }
};

/**
 * Removes any parts of a string that match the regular expression
 * @param {String} str The string to check
 * @returns {String} The string with or without removed values
 */
export const stripNamespace = (str) => {
  const pattern = new RegExp('[A-Za-z0-9-_]+\\.', 'g');
  return str.replace(pattern, '');
};

/**
 * Replaces any parts of a string that match the pattern with the target pattern and capitalizes each word in the string separated by a space
 * @param {String} str The string to check
 * @returns {String} The string with or without replaced values
 */
export const prettifyName = (str) => {
  if (!str) {
    return '';
  }
  const replacedString = str
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
    .replace(/:/g, ': ')
    .trim();
  return replacedString.replace(/(^|\s)\S/g, (match) => match.toUpperCase());
};

/**
 * Prettifies name property of the nested object in a modularPipeline
 * @param {Object} modularPipelines The object whose nested object property needs to be prettified
 * @returns {Object} The object with or without prettified name inside the nested object
 */
export const prettifyModularPipelineNames = (modularPipelines) => {
  for (const key in modularPipelines) {
    if (modularPipelines.hasOwnProperty(key)) {
      const modularPipeline = modularPipelines[key];

      if (modularPipeline.hasOwnProperty('name')) {
        modularPipelines[key] = {
          ...modularPipeline,
          name: prettifyName(modularPipeline['name']),
        };
      }
    }
  }
  return modularPipelines;
};

/**
 * Formats file size for the dataset metadata stats
 * @param {Number} fileSizeInBytes The file size in bytes
 * @returns {String} The formatted file size as e.g. "1.1KB"
 */
export const formatFileSize = (fileSizeInBytes) => {
  // This is to convert bytes to KB or MB.
  const conversionUnit = 1000;

  if (!fileSizeInBytes) {
    // dataset not configured
    return 'N/A';
  } else if (fileSizeInBytes < conversionUnit) {
    // Less than 1 KB
    return `${fileSizeInBytes} bytes`;
  } else if (fileSizeInBytes < conversionUnit * conversionUnit) {
    //  Less than 1 MB
    const sizeInKB = fileSizeInBytes / conversionUnit;
    return `${sizeInKB.toFixed(1)}KB`;
  } else {
    const sizeInMB = fileSizeInBytes / (conversionUnit * conversionUnit);
    return `${sizeInMB.toFixed(1)}MB`;
  }
};

/**
 * Formats a number to a comma separated string
 * @param {Number} number The number to be formatted
 * @returns {String} The formatted number e.g. 2500 -> 2,500
 */
export const formatNumberWithCommas = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Test if Kedro-Viz is running on our known local ports or private IP ranges.
 * @returns {Boolean} True if the app is running locally.
 */
export const isRunningLocally = () => {
  if (typeof window === 'undefined' || !window.location) {
    return false;
  }
  const hosts = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    'demo.kedro.org',
    'gitpod',
    'kedro-org',
  ];

  const hostname = window.location.hostname.toLowerCase();

  // Check if hostname matches known hosts
  if (hosts.some((host) => hostname.includes(host))) {
    return true;
  }

  // Regular expressions for private IP ranges
  const privateIpRanges = [
    // 10.0.0.0 – 10.255.255.255
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
    // 172.16.0.0 – 172.31.255.255
    /^172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}$/,
    // 192.168.0.0 – 192.168.255.255
    /^192\.168\.\d{1,3}\.\d{1,3}$/,
  ];

  // Check if hostname is a private IP address
  return privateIpRanges.some((regex) => regex.test(hostname));
};

/**
 * Append trailing slash to the pathname and remove route-specific parts like /workflow
 * @returns {string} Sanitized pathname
 */
export const sanitizedPathname = () => {
  if (typeof window === 'undefined' || !window.location) {
    return '/';
  }
  const { pathname } = window.location;

  // Remove route-specific parts like /workflow from the path
  const basePath = pathname.replace(/\/(workflow).*$/, '');
  const pathnameWithTrailingSlash = basePath.endsWith('/')
    ? basePath
    : `${basePath}/`; // the `pathname` will have a trailing slash if it didn't initially

  return pathnameWithTrailingSlash;
};

/**
 * Fetches viz metadata from the server.
 * @returns {Promise<Object>} A promise that resolves the fetched viz metadata.
 */
export async function fetchMetadata() {
  const request = await fetch(`${pathRoot}/metadata`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
  return request;
}

export async function deployViz(inputValues) {
  const request = await fetch(`${pathRoot}/deploy`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(inputValues),
  });

  return request;
}

export async function getVersion() {
  const request = await fetch(`${pathRoot}/version`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
  return request;
}

const nodeTypeMapObj = {
  nodes: 'task',
  task: 'nodes',
  datasets: 'data',
  data: 'datasets',
};
/**
 * Mapping task to node and vice versa to keep UI label & the URL consistent
 */
export const mapNodeType = (nodeType) => nodeTypeMapObj[nodeType] || nodeType;

export const mapNodeTypes = (nodeTypes) => {
  return nodeTypes.replace(/task|data/g, (matched) => mapNodeType(matched));
};

/**
 * Test if the passed string value is valid boolean
 * @param {String} inputString
 * @returns {Boolean} true if the inputString is a valid boolean
 */
export const isValidBoolean = (inputString) => {
  return /^(true|false)$/i.test(inputString);
};
