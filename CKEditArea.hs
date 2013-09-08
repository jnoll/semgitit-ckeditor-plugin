module CKEditArea (plugin) where

import Network.Gitit.Interface
import Network.Gitit.Page (parseMetadata)
import Data.Char (toLower, toUpper, isLower, isUpper, isLetter)
import Data.FileStore (FileStore, FileStoreError(..), retrieve)
import System.Directory (doesFileExist)
import System.FilePath ((</>))
import System.IO (readFile)
import Text.JSON.Generic (encodeJSON)
import Text.Pandoc -- (readMarkdown, defaultParserState, ParserState)
import Text.StringTemplate 
import Text.XHtml hiding ((</>))

plugin :: Plugin
plugin = PreEditTransform editArea

editAreaFromTemplate :: [(String, String)] -> String -> StringTemplate String -> Html
editAreaFromTemplate meta content tmpl = 
  primHtml $ render $ setManyAttrib (("contents", content):meta) tmpl


editAreaDefault :: [(String, String)] -> String -> Html
editAreaDefault meta json =
  let fields = map (\(f, v) -> 
                     let fname = "meta_" ++ f in
                     [label << (f ++ ": ")
                     , textfield fname  ! [theclass "sg-meta", thestyle "width: 67%", name fname, maxlength 128, value v]
                     , br]) meta
  in (fields
      +++ label << "Default CKEditor edit area from CKEditArea plugin."
      +++ textarea ! ([cols "20", theclass "ckeditor", name "editedText", identifier "editedText"]) << json
      +++ label << "(end of plugin provided content)"
     )

readTemplate :: FilePath -> IO (Maybe String)
readTemplate path =  do
      exists <- doesFileExist path
      if exists 
        then do
        tmpl <- liftIO $ readFile path
        return  $ Just tmpl
        else return Nothing

data Templates = Templates {
  editTemplate :: String,
  viewTemplate :: String
  } deriving (Show)

filterTemplateBlocks :: Templates ->  Block -> Templates
filterTemplateBlocks a (CodeBlock (_, classes, _) s) 
  | elem "edit-template" classes =  a {editTemplate = s}
  | elem "view-template" classes =  a {viewTemplate = s}
filterTemplateBlocks a _ = a

getTemplatesFromPage :: String -> Templates
getTemplatesFromPage c =
  let Pandoc _ blocks =  readMarkdown def c
  in foldl filterTemplateBlocks (Templates {editTemplate = "", viewTemplate = ""})  blocks
  
getTypeSpecificTemplate :: [(String, String)] -> String -> STGroup String -> PluginM (Maybe (StringTemplate String))
getTypeSpecificTemplate meta field tg = do
  case lookup field meta of
    Just v -> do
      let tmplName = v ++ "_templates"
      (_, raw) <- getPageContentsAndRev tmplName
      let (_, c) = parseMetadata raw
      let t = getTemplatesFromPage c
      let tmpl = newSTMP $ editTemplate t
      return $ getStringTemplate tmplName $ mergeSTGroups tg $ groupStringTemplates [(tmplName, tmpl)]
    Nothing -> return Nothing

getFallbackTemplate :: STGroup String -> Maybe (StringTemplate String)
getFallbackTemplate tg = 
  getStringTemplate "edit_default_ckeditor" tg
  
getTemplate :: [(String, String)] -> STGroup String -> PluginM (Maybe (StringTemplate String))
getTemplate meta tg = do
  t <- getTypeSpecificTemplate meta "type" tg
  case t of
    Just s -> return t
    Nothing -> return $ getFallbackTemplate tg

-- Add elements ("meta_<key>_is_<val>", "val") to meta.
addBooleans :: [(String, String)] -> [(String, String)] 
addBooleans meta =
  foldl (\a (k, v) -> ("meta_" ++ k ++ "_is_" ++ v, head $ words v):a) meta meta
  
editArea :: Html -> PluginM Html
editArea x = 
  case x of
    noHtml -> do
      cfg <- askConfig
      raw <-  askText
      let (meta, c) = parseMetadata raw
      let content = writeHtmlString def $ readMarkdown def  c
      let tmplDir = (templatesDir cfg)
      tg <- liftIO $ (directoryGroup tmplDir :: IO (STGroup String))
      tmpl <- getTemplate meta tg
      case tmpl of 
        Just t -> 
          return $ editAreaFromTemplate (addBooleans meta) content t
        Nothing -> 
          return $ editAreaDefault (addBooleans meta) content
    _ -> return x
