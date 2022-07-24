<script>
  import { onMount, onDestroy } from "svelte";
  import HasFontIcon from "./imgs/font.svelte";
  import defaultBgImg from "./imgs/default_bg.jpeg";
  import bg1 from "./imgs/bg1.jpeg";
  import bg2 from "./imgs/bg2.jpeg";
  import bg3 from "./imgs/bg3.jpeg";
  import bg4 from "./imgs/bg4.jpeg";
  import CheckBox from "./imgs/checkbox.svelte";
  import BgIcon from "./imgs/bgIcon.svelte";
  import { version } from "../package.json";
  const fs = require("fs");

  const { ipcRenderer, shell } = window.require("electron");
  import { toast } from "@zerodevx/svelte-toast";

  let generateResult = {};
  let outputDist = "";
  let loading = false;
  let activeBackgroundImageIndex = 1;
  onMount(() => {
    const localData = JSON.parse(
      localStorage.getItem(`appData-${version}`) || "{}"
    );
    activeBackgroundImageIndex = localData.activeBackgroundImageIndex || 1;

    ipcRenderer.on("fontMinDone", function (event, res) {
      // 接收到Main进程返回的消息
      setTimeout(() => {
        loading = false;
        generateResult = res.data;
      }, 1000);
    });
    ipcRenderer.send("getAppPath");
    ipcRenderer.on("getAppPathDone", function (event, res) {
      // 接收到Main进程返回的消息
      const distname = require("path").join(res, "fontmin");
      if (!fs.existsSync(distname)) {
        fs.mkdirSync(distname);
      }
      outputDist = distname;
    });
  });

  let fontPath = "";
  let fileName = "";
  let text = "";
  let currentFont = null;
  let currentFontFamily = "MyFont";
  let useCdn = false;
  let tempUrls = [];
  let backgroundImages = [defaultBgImg, bg1, bg2, bg3, bg4];

  onDestroy(() => {
    localStorage.setItem(
      `appData-${version}`,
      JSON.stringify({
        activeBackgroundImageIndex,
      })
    );
    tempUrls.forEach((url) => {
      URL.revokeObjectURL(url);
    });
  });
</script>

<!-- svelte-ignore missing-declaration -->
<div
  class="index-page"
  style={`background-image: url(${backgroundImages[activeBackgroundImageIndex]})`}
  on:drop={(e) => {
    e.preventDefault();
    const { name, path } = e.dataTransfer.files[0];
    if (!/\.ttf/.test(name)) {
      return toast.push("仅支持ttf文件", {
        theme: {
          "--toastBarBackground": "transparent",
          "--toastBackground": "rgba(255,255,255,.8)",
          "--toastColor": "#666",
        },
        dismissable: false,
      });
    }
    const tempPath = URL.createObjectURL(e.dataTransfer.files[0]);
    tempUrls.push(tempPath);
    fileName = name;
    fontPath = path;
    currentFontFamily = `MyFont${Date.now()}`;
    currentFont = new FontFace(currentFontFamily, 'url("' + tempPath + '")');
    currentFont.load().then(function (font) {
      document.fonts.add(font);
    });
  }}
  ondragover="return false;"
>
  <div
    class="version"
    on:click={() => {
      // shell.openExternal("https://github.com/xxx/xxx/releases");
    }}
  >
    {version}
  </div>
  <div
    class="switch-bg"
    on:click={() => {
      activeBackgroundImageIndex =
        activeBackgroundImageIndex + 1 >= backgroundImages.length
          ? 0
          : activeBackgroundImageIndex + 1;

      localStorage.setItem(
        `appData-${version}`,
        JSON.stringify({
          activeBackgroundImageIndex,
        })
      );
    }}
  >
    <BgIcon />
  </div>
  <div class="title-bar">
    {#if outputDist}
      <div
        class="bar-btn"
        on:click={() => {
          shell.openPath(generateResult.outputBaseDir || outputDist);
        }}
      >
        打开最近
      </div>
    {/if}
    {#if generateResult.outputDir && !loading}
      <div
        class="bar-btn"
        on:click={() => {
          shell.openPath(generateResult.outputDir);
        }}
      >
        打开产出目录
      </div>
      <div
        class="bar-btn"
        on:click={() => {
          navigator.clipboard.writeText(generateResult.css);
        }}
      >
        复制CSS
      </div>
    {/if}
  </div>
  <div class="header">
    <div class="header-left">
      <div class={`font-icon ${fileName ? "has-font" : ""}`}>
        <HasFontIcon />
      </div>
      <span class="file-name">{fileName ? fileName : "拖入TTF文件以开始"}</span>
    </div>
    <div class="header-right">
      <div
        class="option-item"
        on:click={() => {
          useCdn = !useCdn;
        }}
      >
        <div class="item-icon">
          <CheckBox checked={useCdn} />
        </div>
        <span>上传CDN</span>
      </div>
      <div
        class="convert-btn"
        on:click={() => {
          if (fontPath) {
            loading = true;
            ipcRenderer.send(
              "doFontMin",
              JSON.stringify({
                path: fontPath,
                name: fileName,
                useCdn,
                text,
              })
            );
          }
        }}
      >
        {loading ? "生成中..." : "生成"}
      </div>
    </div>
  </div>
  <div class="body">
    <div class="left">
      <textarea
        class="input-textarea"
        placeholder="请输入想保留的字符"
        on:input={(e) => {
          text = e.target.value;
        }}
      />
    </div>
    <div class="right">
      <div
        class={`output-preview ${text ? "" : "no-text"}`}
        style={`font-family: ${currentFontFamily}`}
      >
        {text || "在这里预览字体样式"}
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .index-page {
    width: 100%;
    height: 100%;
    position: relative;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    transition: background linear 0.3s;
    .switch-bg {
      position: absolute;
      width: 30px;
      height: 30px;
      bottom: 20px;
      left: 20px;
      z-index: 1;
      cursor: pointer;
      :global(svg) {
        width: 100%;
        height: 100%;
      }
    }
    .version {
      position: absolute;
      z-index: 1;
      bottom: 1.5px;
      right: 1.5px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.4);
      cursor: pointer;
    }
    .title-bar {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      height: 40px;
      -webkit-app-region: drag;
      background-color: rgba(0, 0, 0, 0.1);
      display: flex;
      padding-right: 15px;
      .bar-btn {
        padding: 0 8px;
        width: auto;
        height: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(255, 255, 255, 0.3);
        backdrop-filter: blur(10px);
        margin-right: 8px;
        font-size: 13px;
        color: #fff;
        &:last-child {
          margin-right: 0;
        }
        &:hover {
          opacity: 0.8;
        }
        cursor: pointer;
        user-select: none;
        -webkit-app-region: no-drag;
      }
    }
    &.drag-hover {
      background-color: rgba(255, 255, 255, 0.8);
    }
    .header {
      width: 100%;
      height: 80px;
      backdrop-filter: blur(50px);
      background-color: rgba(0, 0, 0, 0.05);
      padding: 0 15px;
      color: rgba(255, 255, 255, 0.8);
      display: flex;
      justify-content: space-between;
      align-items: center;
      .header-left {
        display: flex;
        align-items: center;
        width: 0;
        flex: 1 1 auto;
        .font-icon {
          width: 40px;
          height: 40px;
          display: none;
          flex: 0 0 auto;
          :global(svg) {
            width: 100%;
            height: 100%;
            transition: opacity ease-in-out 0.3s;
          }
          &.has-font {
            display: block;
          }
        }
        .file-name {
          flex: 1 1 auto;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 40px;
          font-style: italic;
          font-family: PingFang SC;
          user-select: none;
        }
      }

      .header-right {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        .option-item {
          user-select: none;
          cursor: pointer;
          margin-right: 8px;
          display: flex;
          align-items: center;
          .item-icon {
            width: 20px;
            height: 20px;
            :global(svg) {
              width: 100%;
              height: 100%;
              transition: opacity ease-in-out 0.3s;
            }
          }
        }
      }
      .convert-btn {
        flex: 0 0 auto;
        width: 100px;
        height: 44px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(255, 255, 255, 0.3);
        color: #fff;
        cursor: pointer;
        user-select: none;
        &:hover {
          opacity: 0.8;
        }
      }
    }
    .body {
      height: calc(100% - 120px);
      display: flex;
      backdrop-filter: blur(50px);
    }
    .left,
    .right {
      width: 0%;
      flex: 1 1 auto;
      display: flex;
      justify-content: center;
    }
    .left {
      padding: 15px;
      padding-right: 7.5px;
      .input-textarea {
        box-sizing: border-box;
        padding: 15px;
        width: 100%;
        height: 100%;
        font-size: 20px;
        background-color: rgba(255, 255, 255, 0.1);
        color: #fff;
        &::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }
        text-shadow: 2px 1px 2px rgba(150, 150, 150, 0.32);
        &::-webkit-scrollbar {
          background-color: transparent;
          width: 10px;
        }
        &::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          width: 10px;
          height: 20px;
          &:hover {
            cursor: default;
          }
        }
      }
    }
    .right {
      padding: 15px;
      padding-left: 7.5px;
      .output-preview {
        font-family: MyFont;
        box-sizing: border-box;
        padding: 15px;
        width: 100%;
        height: 100%;
        font-size: 20px;
        background-color: rgba(255, 255, 255, 0.1);
        color: #fff;
        text-shadow: 2px 1px 2px rgba(150, 150, 150, 0.32);
        word-break: break-all;
        &.no-text {
          color: rgba(255, 255, 255, 0.7);
        }
        overflow-y: auto;
        &::-webkit-scrollbar {
          background-color: transparent;
          width: 10px;
        }
        &::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          width: 10px;
          height: 20px;
          &:hover {
            cursor: default;
          }
        }
      }
    }
    .setting-box {
      position: absolute;
      top: 55%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100px;
      height: 50px;
      display: flex;
      justify-content: center;
      .item {
        width: 24px;
        height: 24px;
        :global(svg) {
          width: 100%;
          height: 100%;
        }
      }
    }
    .center-btn {
      position: absolute;
      top: 35%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100px;
      height: 100px;
      background-color: deepskyblue;
      border-radius: 50%;
      :global(svg) {
        width: 100%;
        height: 100%;
        opacity: 0;
        transition: opacity ease-in-out 0.3s;
      }
      &.has-font {
        :global(svg) {
          opacity: 1;
        }
        cursor: pointer;
      }
      .font-name {
        position: absolute;
        bottom: -30px;
        left: 50%;
        transform: translateX(-50%);
        color: #fff;
        white-space: nowrap;
        text-align: center;
      }
    }
  }
</style>
