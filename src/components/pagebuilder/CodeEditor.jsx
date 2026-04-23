import React, { useState, useEffect } from 'react';
import { X, Code2, Eye, Copy, RotateCcw, Save, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';

const CodeEditor = ({ section, onSectionUpdate, onClose }) => {
  const [activeTab, setActiveTab] = useState('html');
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState(null);
  
  // Initialize code from section
  useEffect(() => {
    if (section) {
      setHtmlCode(section.html || '');
      setCssCode(section.css || '');
      setHasChanges(false);
    }
  }, [section]);

  // Track changes
  useEffect(() => {
    if (section) {
      const htmlChanged = htmlCode !== (section.html || '');
      const cssChanged = cssCode !== (section.css || '');
      setHasChanges(htmlChanged || cssChanged);
    }
  }, [htmlCode, cssCode, section]);

  const handleSave = () => {
    if (!section) return;
    
    try {
      // Basic HTML validation
      if (htmlCode.trim()) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlCode, 'text/html');
        const parserError = doc.querySelector('parsererror');
        if (parserError) {
          throw new Error('Invalid HTML syntax');
        }
      }

      onSectionUpdate(section.id, {
        html: htmlCode,
        css: cssCode
      });
      
      setHasChanges(false);
      setError(null);
      toast.success('Code saved successfully!');
    } catch (err) {
      setError(err.message);
      toast.error('Failed to save: ' + err.message);
    }
  };

  const handleReset = () => {
    if (section) {
      setHtmlCode(section.html || '');
      setCssCode(section.css || '');
      setHasChanges(false);
      setError(null);
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      toast.success('Code copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy code');
    });
  };

  const formatCode = (code, type) => {
    // Basic code formatting
    if (type === 'html') {
      return code
        .replace(/></g, '>\n<')
        .replace(/^\s+|\s+$/g, '')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n');
    }
    
    if (type === 'css') {
      return code
        .replace(/\{/g, ' {\n  ')
        .replace(/\}/g, '\n}\n')
        .replace(/;/g, ';\n  ')
        .replace(/^\s+|\s+$/g, '')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n');
    }
    
    return code;
  };

  const renderPreview = () => {
    if (!htmlCode && !cssCode) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <Code2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p>No code to preview</p>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full bg-white">
        <style dangerouslySetInnerHTML={{ __html: cssCode }} />
        <div dangerouslySetInnerHTML={{ __html: htmlCode }} />
      </div>
    );
  };

  if (!section) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full h-full max-w-7xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Code Editor</h2>
            <p className="text-sm text-gray-500">
              Editing: {section.type} section
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Preview Toggle */}
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center px-3 py-2 text-sm rounded-lg ${
                previewMode
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Eye className="h-4 w-4 mr-2" />
              {previewMode ? 'Edit Code' : 'Preview'}
            </button>
            
            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex items-center px-3 py-2 text-sm text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </button>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {!previewMode ? (
            <>
              {/* Code Editor Tabs */}
              <div className="w-1/2 flex flex-col border-r border-gray-200">
                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab('html')}
                    className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 ${
                      activeTab === 'html'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    HTML
                  </button>
                  <button
                    onClick={() => setActiveTab('css')}
                    className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 ${
                      activeTab === 'css'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    CSS
                  </button>
                </div>

                {/* Code Editor */}
                <div className="flex-1 relative">
                  {/* Toolbar */}
                  <div className="absolute top-0 right-0 p-2 flex space-x-1 bg-white border-l border-b border-gray-200 rounded-bl-lg z-10">
                    <button
                      onClick={() => copyToClipboard(activeTab === 'html' ? htmlCode : cssCode)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                      title="Copy code"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (activeTab === 'html') {
                          setHtmlCode(formatCode(htmlCode, 'html'));
                        } else {
                          setCssCode(formatCode(cssCode, 'css'));
                        }
                      }}
                      className="p-1 text-gray-500 hover:text-gray-700"
                      title="Format code"
                    >
                      <Code2 className="h-4 w-4" />
                    </button>
                  </div>

                  <textarea
                    value={activeTab === 'html' ? htmlCode : cssCode}
                    onChange={(e) => {
                      if (activeTab === 'html') {
                        setHtmlCode(e.target.value);
                      } else {
                        setCssCode(e.target.value);
                      }
                      setError(null);
                    }}
                    className="w-full h-full p-4 font-mono text-sm border-none resize-none focus:outline-none bg-gray-50"
                    placeholder={
                      activeTab === 'html'
                        ? '<!-- Enter your HTML code here -->\n<div class="my-section">\n  <h2>Section Title</h2>\n  <p>Section content goes here.</p>\n</div>'
                        : '/* Enter your CSS code here */\n.my-section {\n  background: #f9fafb;\n  padding: 2rem;\n  border-radius: 0.5rem;\n}'
                    }
                    spellCheck={false}
                  />

                  {/* Line numbers (simplified) */}
                  <div className="absolute left-0 top-0 p-4 text-xs text-gray-400 pointer-events-none select-none font-mono">
                    {(activeTab === 'html' ? htmlCode : cssCode)
                      .split('\n')
                      .map((_, index) => (
                        <div key={index} className="h-5 leading-5">
                          {index + 1}
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Live Preview */}
              <div className="w-1/2 flex flex-col">
                <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-700">Live Preview</h3>
                  <div className="text-xs text-gray-500">
                    Changes update automatically
                  </div>
                </div>
                <div className="flex-1 overflow-auto bg-white">
                  {renderPreview()}
                </div>
              </div>
            </>
          ) : (
            /* Full Preview Mode */
            <div className="flex-1 overflow-auto bg-white">
              {renderPreview()}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              {hasChanges ? (
                <span className="flex items-center text-orange-600">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                  Unsaved changes
                </span>
              ) : (
                <span className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  All changes saved
                </span>
              )}
            </div>
            
            <div className="text-sm text-gray-500">
              HTML: {htmlCode.length} chars | CSS: {cssCode.length} chars
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleReset}
              disabled={!hasChanges}
              className="flex items-center px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </button>
            
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;