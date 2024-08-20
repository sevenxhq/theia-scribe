import { unzip } from "unzipit";
import {
  ConfigResourceValues,
  Door43ApiResponse,
  Door43RepoResponse,
} from "./types";
import { URI } from "@theia/core";
import { BinaryBuffer } from "@theia/core/lib/common/buffer";
import moment from "moment";
import { FileService } from "@theia/filesystem/lib/browser/file-service";

export const downloadDoor43Resource = async (
  resourceHandlerId: string,
  resourceInfo: Record<string, any>,
  { fs, resourceFolderUri }: { fs: FileService; resourceFolderUri: URI }
) => {
  const fullResource = resourceInfo["fullResource"] as Door43RepoResponse;
  const downloadProjectName = `${fullResource?.name}`;
  const downloadResourceFolder = resourceFolderUri.withPath(
    resourceFolderUri.path.join(downloadProjectName)
  );

  await fs.createFolder(downloadResourceFolder);

  const result = await unzip(fullResource.zipball_url);
  const keys = Object.keys(result.entries);
  for (const key of keys) {
    const item = result.entries[key];

    if (!item.isDirectory) {
      const bufferContent = Buffer.from(await item.arrayBuffer());
      const path = [...item?.name?.split("/")];
      path.shift();
      const fileUri = URI.fromFilePath(
        downloadResourceFolder.path.join(path.join("/")).toString()
      );
      await fs.writeFile(fileUri, BinaryBuffer.wrap(bufferContent));
    }
  }

  const metadataRes = await fetch(fullResource.metadata_json_url);
  const data = (await metadataRes.json()) as Record<string, any>;
  data.agOffline = true;
  data.meta = fullResource;
  data.lastUpdatedAg = moment().format();
  await fs.writeFile(
    URI.fromFilePath(
      downloadResourceFolder.path.join("metadata.json").toString()
    ),
    BinaryBuffer.fromString(JSON.stringify(data))
  );

  const resourceReturn = {
    resource: fullResource,
    folder: downloadResourceFolder,
    type: resourceHandlerId,
  };

  const localPath: string = resourceReturn?.folder.path.toString();

  const downloadedResource: ConfigResourceValues = {
    name: resourceReturn?.resource.name ?? "",
    id: String(resourceReturn?.resource.id) ?? "",
    localPath: localPath,
    type: resourceReturn.type,
    remoteUrl: resourceReturn?.resource.url ?? "",
    version: resourceReturn?.resource.release.tag_name,
  };

  return downloadedResource;
};

export const fetchDoor43ResourceDisplayData = async (
  resourceTypeId: string,
  params: {
    [x: string]: string;
    subject: string;
    metadataType: string;
  }
) => {
  const urlParams = new URLSearchParams(params);

  const resourceUrl = `https://git.door43.org/api/v1/catalog/search?${urlParams.toString()}`;

  const response = await fetch(resourceUrl);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch resources from Door43 API. Status: ${response.status}`
    );
  }
  const responseJson = (await response.json()) as Door43ApiResponse;
  if (responseJson?.data) {
    return responseJson.data.map((resource) => ({
      id: resource.id.toString(),
      name: resource.name,
      owner: {
        name: resource.repo.owner.full_name,
        url: resource.repo.owner.website,
        avatarUrl: resource.repo.owner.avatar_url,
      },
      version: {
        tag: resource.release.tag_name,
        releaseDate: new Date(resource.released),
      },
      fullResource: resource,
      resourceType: resourceTypeId,
    }));
  }
};
