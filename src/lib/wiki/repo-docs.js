// Documents from the MooshieUI repository that the site wiki shows next to the
// GitHub wiki pages. scripts/sync-wiki.mjs copies them into ./wiki/repo/<slug>.md
// and src/lib/server/wiki.js renders them. Plain JS: the sync script imports it too.
export const REPO = 'Mooshieblob1/MooshieUI';

export const REPO_DOC_GROUPS = [
	{
		title: 'Project docs',
		icon: 'folder',
		docs: [
			{ slug: 'readme', path: 'README.md', title: 'Project README', icon: 'book' },
			{ slug: 'contributing-guide', path: '.github/CONTRIBUTING.md', title: 'Contributing Guide', icon: 'git' },
			{ slug: 'pull-request-workflow', path: 'docs/push-instructions.md', title: 'Pull Request Workflow', icon: 'git' },
			{ slug: 'security-policy', path: 'SECURITY.md', title: 'Security Policy', icon: 'shield' },
			{ slug: 'agents', path: 'AGENTS.md', title: 'Guide for AI Agents', icon: 'bot' },
			{ slug: 'docs-index', path: 'docs/README.md', title: 'Docs Index', icon: 'list' }
		]
	},
	{
		title: 'Technical reference',
		icon: 'code',
		docs: [
			{ slug: 'mcp-reference', path: 'docs/MCP.md', title: 'MCP Server Reference', icon: 'bot' },
			{ slug: 'metadata-carriers', path: 'docs/METADATA_CARRIERS.md', title: 'Metadata Carriers', icon: 'image' },
			{ slug: 'random-prompt-syntax', path: 'docs/RANDOM_PROMPTS.md', title: 'Random Prompt Syntax', icon: 'shuffle' },
			{ slug: 'style-reference', path: 'docs/STYLE_REFERENCE.md', title: 'Style Reference', icon: 'shapes' },
			{ slug: 'video-methods', path: 'docs/VIDEO.md', title: 'Video Methods', icon: 'film' },
			{ slug: 'music-studio', path: 'docs/MUSIC.md', title: 'Music Studio', icon: 'music' },
			{ slug: 'image-to-3d-reference', path: 'docs/IMAGE_TO_3D.md', title: 'Image to 3D Reference', icon: 'cube' },
			{ slug: 'macos', path: 'docs/MACOS.md', title: 'macOS (Apple Silicon)', icon: 'laptop' },
			{ slug: 'prompt-assistant-sign-in', path: 'docs/PROMPT-ASSISTANT-SIGN-IN.md', title: 'Prompt Assistant Sign-in', icon: 'key' },
			{ slug: 'elevenlabs-prompting-rules', path: 'docs/ELEVENLABS_PROMPTING_AGENTS.md', title: 'ElevenLabs Prompting Rules', icon: 'mic' },
			{ slug: 'seedance-prompting-rules', path: 'docs/SEEDANCE_PROMPTING_AGENTS.md', title: 'Seedance Prompting Rules', icon: 'clapper' }
		]
	}
];

export const REPO_DOCS = REPO_DOC_GROUPS.flatMap((g) => g.docs);
