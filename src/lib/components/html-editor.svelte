<script>
	let { value = $bindable(''), placeholder = 'Enter content...' } = $props();
	
	let editorRef;
	let isBold = $state(false);
	let isItalic = $state(false);
	let isUnderline = $state(false);
	
	// Sync editor content when value changes externally
	$effect(() => {
		if (editorRef && editorRef.innerHTML !== value) {
			editorRef.innerHTML = value || '';
		}
	});
	
	function execCommand(command, value = null) {
		document.execCommand(command, false, value);
		editorRef?.focus();
		updateToolbarState();
		updateValue();
	}
	
	function updateToolbarState() {
		isBold = document.queryCommandState('bold');
		isItalic = document.queryCommandState('italic');
		isUnderline = document.queryCommandState('underline');
	}
	
	function updateValue() {
		if (editorRef) {
			value = editorRef.innerHTML;
		}
	}
	
	function handleInput() {
		updateValue();
	}
	
	function handlePaste(e) {
		e.preventDefault();
		const text = e.clipboardData.getData('text/plain');
		document.execCommand('insertText', false, text);
		updateValue();
	}
	
	function createLink() {
		const url = prompt('Enter URL:');
		if (url) {
			execCommand('createLink', url);
		}
	}
	
	function removeLink() {
		execCommand('unlink');
	}
	
	function insertList(ordered = false) {
		execCommand(ordered ? 'insertOrderedList' : 'insertUnorderedList');
	}
</script>

<div class="border-border bg-card rounded-xl border">
	<!-- Toolbar -->
	<div class="border-border flex flex-wrap items-center gap-2 border-b p-3">
		<button
			type="button"
			onclick={() => execCommand('bold')}
			class="hover:bg-secondary rounded-lg p-2 transition-colors {isBold ? 'bg-primary/10 text-primary' : ''}"
			title="Bold"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z"
				/>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"
				/>
			</svg>
		</button>
		
		<button
			type="button"
			onclick={() => execCommand('italic')}
			class="hover:bg-secondary rounded-lg p-2 transition-colors {isItalic ? 'bg-primary/10 text-primary' : ''}"
			title="Italic"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
				/>
			</svg>
		</button>
		
		<button
			type="button"
			onclick={() => execCommand('underline')}
			class="hover:bg-secondary rounded-lg p-2 transition-colors {isUnderline ? 'bg-primary/10 text-primary' : ''}"
			title="Underline"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M5 19h14M5 7h14"
				/>
			</svg>
		</button>
		
		<div class="border-border h-6 w-px border-l"></div>
		
		<button
			type="button"
			onclick={createLink}
			class="hover:bg-secondary rounded-lg p-2 transition-colors"
			title="Insert Link"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
				/>
			</svg>
		</button>
		
		<button
			type="button"
			onclick={removeLink}
			class="hover:bg-secondary rounded-lg p-2 transition-colors"
			title="Remove Link"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
				/>
			</svg>
		</button>
		
		<div class="border-border h-6 w-px border-l"></div>
		
		<button
			type="button"
			onclick={() => insertList(false)}
			class="hover:bg-secondary rounded-lg p-2 transition-colors"
			title="Bullet List"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
				/>
			</svg>
		</button>
		
		<button
			type="button"
			onclick={() => insertList(true)}
			class="hover:bg-secondary rounded-lg p-2 transition-colors"
			title="Numbered List"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
				/>
			</svg>
		</button>
		
		<div class="border-border h-6 w-px border-l"></div>
		
		<button
			type="button"
			onclick={() => execCommand('formatBlock', '<h2>')}
			class="hover:bg-secondary rounded-lg px-3 py-2 text-sm transition-colors"
			title="Heading"
		>
			H2
		</button>
		
		<button
			type="button"
			onclick={() => execCommand('formatBlock', '<h3>')}
			class="hover:bg-secondary rounded-lg px-3 py-2 text-sm transition-colors"
			title="Subheading"
		>
			H3
		</button>
		
		<button
			type="button"
			onclick={() => execCommand('formatBlock', '<p>')}
			class="hover:bg-secondary rounded-lg px-3 py-2 text-sm transition-colors"
			title="Paragraph"
		>
			P
		</button>
	</div>
	
	<!-- Editor -->
	<div
		bind:this={editorRef}
		contenteditable="true"
		oninput={handleInput}
		onpaste={handlePaste}
		onmouseup={updateToolbarState}
		onkeyup={updateToolbarState}
		class="text-foreground min-h-[300px] w-full resize-none rounded-b-xl bg-background p-4 focus:outline-none"
		style="white-space: pre-wrap;"
		data-placeholder={placeholder}
	>
		{@html value}
	</div>
</div>

<style>
	[contenteditable='true']:empty:before {
		content: attr(data-placeholder);
		color: var(--color-muted-foreground);
	}
	
	[contenteditable='true']:focus {
		outline: none;
	}
	
	[contenteditable='true'] a {
		color: var(--color-primary);
		text-decoration: underline;
	}
	
	[contenteditable='true'] h2 {
		font-size: 1.5rem;
		font-weight: 600;
		margin-top: 1rem;
		margin-bottom: 0.5rem;
	}
	
	[contenteditable='true'] h3 {
		font-size: 1.25rem;
		font-weight: 600;
		margin-top: 0.75rem;
		margin-bottom: 0.5rem;
	}
	
	[contenteditable='true'] ul,
	[contenteditable='true'] ol {
		margin-left: 1.5rem;
		margin-top: 0.5rem;
		margin-bottom: 0.5rem;
	}
	
	[contenteditable='true'] p {
		margin-bottom: 0.5rem;
	}
</style>
