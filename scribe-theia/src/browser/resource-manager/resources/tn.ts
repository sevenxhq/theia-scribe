import { URI } from "@theia/core";
import {
  ScribeResource,
  TwlApiResponse,
  Twl,
  ConfigResourceValues,
} from "./types";
import { BinaryBuffer } from "@theia/core/lib/common/buffer";
import moment from "moment";
import { unzip } from "unzipit";

export const tnResource: ScribeResource<Twl> = {
  id: "codex.tn",
  displayLabel: "Translation Notes",

  getTableDisplayData: async () => {
    const resourceUrl = `https://git.door43.org/api/v1/catalog/search?subject=TSV Translation Notes&metadataType=rc`;
    const response = await fetch(resourceUrl);
    const responseJson = (await response.json()) as TwlApiResponse;
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
        resourceType: tnResource.id,
      }));
    }
    return [];
  },

  async downloadResource(resourceInfo, { fs, resourceFolderUri }) {
    const fullResource = resourceInfo["fullResource"] as Twl;
    const downloadProjectName = `${fullResource?.name}`;
    const downloadResourceFolder = resourceFolderUri.withPath(
      resourceFolderUri.path.join(downloadProjectName)
    );

    await fs.createFolder(downloadResourceFolder);

    const result = await unzip(fullResource.zipball_url);
    const keys = Object.keys(result.entries);
    for (const key of keys) {
      const item = result.entries[key];

      if (item.isDirectory) {
      } else {
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
      type: resourceInfo.id,
    };

    const localPath: string = resourceReturn?.folder.path.toString();

    const downloadedResource: ConfigResourceValues = {
      name: resourceReturn?.resource.name ?? "",
      id: String(resourceReturn?.resource.id) ?? "",
      localPath: localPath,
      type: resourceReturn?.type ?? "",
      remoteUrl: resourceReturn?.resource.url ?? "",
      version: resourceReturn?.resource.release.tag_name,
    };

    return downloadedResource;
  },
};
