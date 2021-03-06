/**
 * @name NitroEmoteAndScreenShareBypass
 * @author Drip
 * @authorId 737323631117598811
 * @version 4.1
 * @description Send Nitro emotes and enable high quality screen sharing without Nitro
 * @website https://vacban.wtf
 * @source https://github.com/DrippyHvH/nitro
 * @updateUrl https://raw.githubusercontent.com/DrippyHvH/nitro/main/NitroEmoteAndScreenShareBypass.plugin.js
 */
module.exports = (() => {
  const config = {
    info: {
      name: "NitroEmoteAndScreenShareBypass",
      authors: [
        {
          name: "Drip",
          discord_id: "737323631117598811",
          github_username: "DrippyHvH",
        },
      ],
      version: "4.1",
      description:
        "Send Nitro emojis and enable high quality screen sharing without Nitro",
      github: "https://github.com/DrippyHvH/nitro",
      github_raw:
        "https://raw.githubusercontent.com/DrippyHvH/nitro/main/NitroEmoteAndScreenShareBypass.plugin.js",
    },
    main: "NitroEmoteAndScreenShareBypass.plugin.js",
  };

  return !global.ZeresPluginLibrary
    ? class {
        constructor() {
          this._config = config;
        }
        getName() {
          return config.info.name;
        }
        getAuthor() {
          return config.info.authors.map((a) => a.name).join(", ");
        }
        getDescription() {
          return config.info.description;
        }
        getVersion() {
          return config.info.version;
        }
        load() {
          BdApi.showConfirmationModal(
            "Library Missing",
            `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`,
            {
              confirmText: "Download Now",
              cancelText: "Cancel",
              onConfirm: () => {
                require("request").get(
                  "https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js",
                  async (error, response, body) => {
                    if (error)
                      return require("electron").shell.openExternal(
                        "https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js"
                      );
                    await new Promise((r) =>
                      require("fs").writeFile(
                        require("path").join(
                          BdApi.Plugins.folder,
                          "0PluginLibrary.plugin.js"
                        ),
                        body,
                        r
                      )
                    );
                  }
                );
              },
            }
          );
        }
        start() {}
        stop() {}
      }
    : (([Plugin, Api]) => {
        const plugin = (Plugin, Api) => {
          const { Patcher, DiscordModules, Settings, PluginUtilities } = Api;
          return class NitroEmoteAndScreenShareBypass extends Plugin {
            settings = PluginUtilities.loadSettings(this.getName(), {
              size: 48,
            });
            getSettingsPanel() {
              return Settings.SettingPanel.build(
                (_) =>
                  PluginUtilities.saveSettings(this.getName(), this.settings),
                ...[
                  new Settings.Slider(
                    "Emoji size",
                    "Chose the size of emojis.",
                    16,
                    128,
                    this.settings.size,
                    (size) => (this.settings.size = size),
                    {
                      markers: [16, 20, 32, 48, 64, 128],
                      stickToMarkers: true,
                    }
                  ),
                ]
              );
            }

            onStart() {
              ZeresPluginLibrary.DiscordModules.UserStore.getCurrentUser().premiumType = 2;

              Patcher.before(
                DiscordModules.MessageActions,
                "sendMessage",
                (_, [, message]) => {
                  const emojis = message.validNonShortcutEmojis;

                  emojis.forEach((emoji) => {
                    // skip discord emojis
                    if (!emoji.require_colons) return;

                    // create the emoji string which we will replace
                    const emojiString = `<${emoji.animated ? "a" : ""}:${
                      emoji.name
                    }:${emoji.id}>`;

                    let url = emoji.url;

                    // change the size of the emoji in the url
                    const size = this.settings.size;
                    if (size != 48) {
                      url = url.replace(/\?size=[0-9]+/, `?size=${size}`);
                    }

                    // replace the message containing the emoji with the url
                    message.content = message.content.replace(emojiString, url);
                  });
                }
              );
            }

            onStop() {
              Patcher.unpatchAll();
            }
          };
        };
        return plugin(Plugin, Api);
      })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
