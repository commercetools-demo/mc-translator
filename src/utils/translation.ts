/* eslint-disable @typescript-eslint/no-explicit-any */
declare var gapi: any;

const googleTranslate = async (
  textToTranslate: string | string[],
  targetLanguage: string,
  sourceLanguage: string,
  projectID: string
) => {
  const response = await gapi.client.translate.projects.translateText({
    parent: `projects/${projectID}`,
    resource: {
      targetLanguageCode: targetLanguage,
      sourceLanguageCode: sourceLanguage,
      contents: textToTranslate,
    },
  });

  return response.result.translations;
};

export { googleTranslate };
