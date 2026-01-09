import { describe, it, expect } from 'vitest'
import { memoryUploadHandler } from '~/utils/uploadFile'
import { Readable } from 'stream'

describe('memoryUploadHandler', () => {
  it('should handle file uploads with data stream', async () => {
    // Create a mock file upload with data stream
    const testData = Buffer.from('test file content')
    const stream = Readable.from([testData])

    const mockFileUpload = {
      name: 'image',
      filename: 'test.jpg',
      contentType: 'image/jpeg',
      data: stream
    }

    const result = await memoryUploadHandler(mockFileUpload as any)

    expect(result).toBeInstanceOf(File)
    expect(result.name).toBe('test.jpg')
    expect(result.type).toBe('image/jpeg')
    expect(result.size).toBe(testData.length)
  })

  it('should handle non-file form fields (no data property)', async () => {
    // Create a mock form field without data property
    const mockFormField = {
      name: 'body',
      filename: '',
      contentType: 'text/plain'
      // Note: no 'data' property
    }

    const result = await memoryUploadHandler(mockFormField as any)

    // Should return the field as-is when there's no data
    expect(result).toBe(mockFormField)
  })

  it('should handle regular text fields', async () => {
    // Simulate a text field that parseFormData might pass
    const mockTextField = {
      name: 'description',
      value: 'Some text value'
      // No data property for text fields
    }

    const result = await memoryUploadHandler(mockTextField as any)

    // Should return unchanged
    expect(result).toBe(mockTextField)
  })

  it('should handle empty file data stream', async () => {
    const emptyStream = Readable.from([])

    const mockFileUpload = {
      name: 'image',
      filename: 'empty.txt',
      contentType: 'text/plain',
      data: emptyStream
    }

    const result = await memoryUploadHandler(mockFileUpload as any)

    expect(result).toBeInstanceOf(File)
    expect(result.name).toBe('empty.txt')
    expect(result.size).toBe(0)
  })

  it('should handle large file uploads by chunking', async () => {
    // Create multiple chunks to simulate a large file
    const chunk1 = Buffer.from('chunk1')
    const chunk2 = Buffer.from('chunk2')
    const chunk3 = Buffer.from('chunk3')
    const stream = Readable.from([chunk1, chunk2, chunk3])

    const mockFileUpload = {
      name: 'video',
      filename: 'large-video.mp4',
      contentType: 'video/mp4',
      data: stream
    }

    const result = await memoryUploadHandler(mockFileUpload as any)

    expect(result).toBeInstanceOf(File)
    expect(result.name).toBe('large-video.mp4')
    expect(result.type).toBe('video/mp4')
    // Verify all chunks were concatenated
    const expectedSize = chunk1.length + chunk2.length + chunk3.length
    expect(result.size).toBe(expectedSize)
  })
})
